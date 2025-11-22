import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'
import { checkUserOrganizationAccess } from '@/lib/database'

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get query parameters
    const url = new URL(req.url)
    const requestedUserId = url.searchParams.get('userId')
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    // Verify user can only access their own data
    if (requestedUserId && requestedUserId !== userId) {
      return NextResponse.json(
        { error: 'Access denied - can only access your own data' },
        { status: 403 }
      )
    }

    // Build query - filter by current user's ID
    let query = supabase
      .from('user_searches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Apply status filter if provided
    if (status && ['pending', 'processing', 'completed', 'failed'].includes(status)) {
      query = query.eq('status', status as 'pending' | 'processing' | 'completed' | 'failed')
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('user_searches')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: searches, error: searchError } = await query

    if (searchError) {
      console.error('Error fetching searches:', searchError)
      return NextResponse.json(
        { error: 'Failed to fetch searches' },
        { status: 500 }
      )
    }

    // Get lead counts for each search
    const searchesWithCounts = await Promise.all(
      (searches || []).map(async (search) => {
        const { data: leadsData, count: leadCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact' })
          .eq('search_id', search.id)

        console.log(`Search ${search.id}: Found ${leadCount} leads`);

        return {
          ...search,
          leads_count: leadCount || 0,
          leads_found: leadCount || 0,
          user_name: 'You'
        }
      })
    )

    return NextResponse.json({
      success: true,
      searches: searchesWithCounts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Error in searches API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get search statistics for organization
export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { organization_id, date_range = '30d' } = body

    if (!organization_id) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    // Verify user has access to the organization
    const hasAccess = await checkUserOrganizationAccess(user.id, organization_id)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to organization' },
        { status: 403 }
      )
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (date_range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      default:
        startDate.setDate(endDate.getDate() - 30)
    }

    // Get search statistics
    const { data: searchStats } = await supabase
      .from('user_searches')
      .select('status, created_at')
      .eq('organization_id', organization_id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Get lead statistics
    const { data: leadStats } = await supabase
      .from('leads')
      .select('created_at, confidence_score')
      .eq('organization_id', organization_id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Calculate statistics
    const stats = {
      total_searches: searchStats?.length || 0,
      completed_searches: searchStats?.filter(s => s.status === 'completed').length || 0,
      failed_searches: searchStats?.filter(s => s.status === 'failed').length || 0,
      pending_searches: searchStats?.filter(s => s.status === 'pending').length || 0,
      processing_searches: searchStats?.filter(s => s.status === 'processing').length || 0,
      total_leads: leadStats?.length || 0,
      average_confidence: (leadStats && leadStats.length > 0) 
        ? leadStats.reduce((sum, lead) => sum + (lead.confidence_score || 0), 0) / leadStats.length
        : 0,
      high_quality_leads: leadStats?.filter(lead => (lead.confidence_score || 0) >= 80).length || 0,
      date_range: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        period: date_range
      }
    }

    // Calculate daily breakdown
    const dailyBreakdown = generateDailyBreakdown(searchStats || [], leadStats || [], startDate, endDate)

    return NextResponse.json({
      success: true,
      statistics: stats,
      daily_breakdown: dailyBreakdown
    })

  } catch (error) {
    console.error('Error generating search statistics:', error)
    return NextResponse.json(
      { error: 'Failed to generate statistics' },
      { status: 500 }
    )
  }
}

function generateDailyBreakdown(
  searches: any[], 
  leads: any[], 
  startDate: Date, 
  endDate: Date
) {
  const breakdown = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const nextDate = new Date(currentDate)
    nextDate.setDate(nextDate.getDate() + 1)
    
    const daySearches = searches.filter(s => {
      const searchDate = new Date(s.created_at)
      return searchDate >= currentDate && searchDate < nextDate
    })
    
    const dayLeads = leads.filter(l => {
      const leadDate = new Date(l.created_at)
      return leadDate >= currentDate && leadDate < nextDate
    })
    
    breakdown.push({
      date: dateStr,
      searches: daySearches.length,
      completed_searches: daySearches.filter(s => s.status === 'completed').length,
      leads: dayLeads.length,
      average_confidence: dayLeads.length > 0
        ? dayLeads.reduce((sum, lead) => sum + (lead.confidence_score || 0), 0) / dayLeads.length
        : 0
    })
    
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return breakdown
}
