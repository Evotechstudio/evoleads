import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../../lib/supabase'
import { 
  getSearchLeads,
  checkUserOrganizationAccess
} from '../../../../../lib/database'
import { applyLeadFilters, parseSearchFilters } from '../../../../../lib/lead-generation/utils'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ searchId: string }> }
) {
  const supabase = createServerClient()
  
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchId } = await params
    
    // Get search details
    const { data: search, error: searchError } = await supabase
      .from('user_searches')
      .select('*')
      .eq('id', searchId)
      .single()

    if (searchError || !search) {
      return NextResponse.json(
        { error: 'Search not found' },
        { status: 404 }
      )
    }

    // Verify user has access to the organization
    const hasAccess = await checkUserOrganizationAccess(user.id, search.organization_id)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get leads for this search
    const leads = await getSearchLeads(searchId)

    // Parse query parameters for filtering
    const url = new URL(req.url)
    const filters = parseSearchFilters({
      minConfidenceScore: parseInt(url.searchParams.get('minConfidenceScore') || '0'),
      hasEmail: url.searchParams.get('hasEmail') === 'true',
      hasPhone: url.searchParams.get('hasPhone') === 'true',
      hasWebsite: url.searchParams.get('hasWebsite') === 'true',
      sortBy: url.searchParams.get('sortBy') || 'confidence_score',
      sortOrder: url.searchParams.get('sortOrder') || 'desc'
    })

    // Apply filters
    const filteredLeads = applyLeadFilters(leads, filters)

    // Pagination
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = (page - 1) * limit
    const paginatedLeads = filteredLeads.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      search: {
        id: search.id,
        status: search.status,
        business_type: search.business_type,
        location: `${search.city}, ${search.state}, ${search.country}`,
        leads_requested: search.leads_requested,
        created_at: search.created_at
      },
      leads: paginatedLeads,
      pagination: {
        page,
        limit,
        total: filteredLeads.length,
        totalPages: Math.ceil(filteredLeads.length / limit)
      },
      filters: filters
    })

  } catch (error) {
    console.error('Error fetching search results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export leads as CSV
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ searchId: string }> }
) {
  const supabase = createServerClient()
  
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchId } = await params
    const body = await req.json()
    const { format = 'csv', filters = {} } = body
    
    // Get search details
    const { data: search, error: searchError } = await supabase
      .from('user_searches')
      .select('*')
      .eq('id', searchId)
      .single()

    if (searchError || !search) {
      return NextResponse.json(
        { error: 'Search not found' },
        { status: 404 }
      )
    }

    // Verify user has access to the organization
    const hasAccess = await checkUserOrganizationAccess(user.id, search.organization_id)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get and filter leads
    const leads = await getSearchLeads(searchId)
    const filteredLeads = applyLeadFilters(leads, parseSearchFilters(filters))

    if (format === 'csv') {
      const csv = generateCSV(filteredLeads)
      
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="leads-${searchId}.csv"`
        }
      })
    }

    // Return JSON format
    return NextResponse.json({
      success: true,
      leads: filteredLeads,
      count: filteredLeads.length
    })

  } catch (error) {
    console.error('Error exporting leads:', error)
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    )
  }
}

function generateCSV(leads: any[]): string {
  if (leads.length === 0) {
    return 'No leads found'
  }

  // CSV headers
  const headers = [
    'Business Name',
    'Email',
    'Phone',
    'Website',
    'Confidence Score',
    'Created At'
  ]

  // CSV rows
  const rows = leads.map(lead => [
    escapeCSV(lead.business_name || ''),
    escapeCSV(lead.email || ''),
    escapeCSV(lead.phone || ''),
    escapeCSV(lead.website || ''),
    lead.confidence_score || '',
    lead.created_at || ''
  ])

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')

  return csvContent
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}