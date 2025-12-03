import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase'
import { checkUserOrganizationAccess } from '../../../lib/database'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const url = new URL(req.url)
    const searchId = url.searchParams.get('searchId')
    const organizationId = url.searchParams.get('organizationId')
    const userId = url.searchParams.get('userId')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const search = url.searchParams.get('search') || ''

    // Validate required parameters
    if (!searchId && !organizationId && !userId) {
      return NextResponse.json(
        { error: 'Either searchId, organizationId, or userId is required' },
        { status: 400 }
      )
    }

    // Build base query with lead_metadata join
    let query = supabase
      .from('leads')
      .select(`
        *,
        user_searches!inner (
          id,
          business_type,
          country,
          state,
          city,
          leads_requested,
          status,
          created_at,
          organization_id
        ),
        lead_metadata (
          rating,
          review_count,
          address,
          city,
          state,
          google_maps_url,
          place_id
        )
      `)
      .order('created_at', { ascending: false })

    // Filter by search ID if provided
    if (searchId) {
      query = query.eq('search_id', searchId)
      
      // Verify user has access to this search
      const { data: searchData } = await supabase
        .from('user_searches')
        .select('organization_id')
        .eq('id', searchId)
        .single()

      if (searchData) {
        const hasAccess = await checkUserOrganizationAccess(user.id, searchData.organization_id)
        if (!hasAccess) {
          return NextResponse.json(
            { error: 'Access denied to this search' },
            { status: 403 }
          )
        }
      }
    }

    // Filter by organization ID if provided (and no searchId)
    if (organizationId && !searchId && !userId) {
      // Verify user has access to the organization
      const hasAccess = await checkUserOrganizationAccess(user.id, organizationId)
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied to organization' },
          { status: 403 }
        )
      }
      
      query = query.eq('user_searches.organization_id', organizationId)
    }

    // Filter by user ID if provided (and no searchId)
    if (userId && !searchId) {
      // Verify user can only access their own data
      if (userId !== user.id) {
        return NextResponse.json(
          { error: 'Access denied - can only access your own data' },
          { status: 403 }
        )
      }
      
      query = query.eq('user_searches.user_id', userId)
    }

    // Apply search filter if provided
    if (search) {
      query = query.or(`business_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,website.ilike.%${search}%`)
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })

    let count = 0
    
    if (searchId) {
      countQuery = countQuery.eq('search_id', searchId)
      const countResult = await countQuery
      count = countResult.count || 0
    } else if (userId) {
      // For userId, we need to join with user_searches to filter by user_id
      const { count: userCount } = await supabase
        .from('leads')
        .select('*, user_searches!inner(*)', { count: 'exact', head: true })
        .eq('user_searches.user_id', userId)
      count = userCount || 0
    } else if (organizationId) {
      countQuery = countQuery.eq('organization_id', organizationId)
      const countResult = await countQuery
      count = countResult.count || 0
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: leads, error: leadsError } = await query

    if (leadsError) {
      console.error('Error fetching leads:', leadsError)
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      )
    }

    // Transform the data to flatten the search information and include metadata
    const transformedLeads = leads?.map(lead => {
      const metadata = Array.isArray(lead.lead_metadata) ? lead.lead_metadata[0] : lead.lead_metadata
      return {
        id: lead.id,
        organization_id: lead.organization_id,
        search_id: lead.search_id,
        business_name: lead.business_name,
        email: lead.email,
        phone: lead.phone,
        website: lead.website,
        confidence_score: lead.confidence_score,
        created_at: lead.created_at,
        // Include metadata fields
        rating: metadata?.rating || null,
        review_count: metadata?.review_count || null,
        address: metadata?.address || null,
        city: metadata?.city || null,
        state: metadata?.state || null,
        google_maps_url: metadata?.google_maps_url || null,
        place_id: metadata?.place_id || null,
        search_info: lead.user_searches
      }
    }) || []

    return NextResponse.json({
      success: true,
      leads: transformedLeads,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Error in leads API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update lead metadata (favorites and notes)
export async function PATCH(req: NextRequest) {
  const supabase = createServerClient()
  
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { leadId, isFavorited, note } = body

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    // Verify user has access to this lead
    const { data: leadData } = await supabase
      .from('leads')
      .select('organization_id')
      .eq('id', leadId)
      .single()

    if (!leadData) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    const hasAccess = await checkUserOrganizationAccess(user.id, leadData.organization_id)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to this lead' },
        { status: 403 }
      )
    }

    // Upsert lead metadata
    const { data: metadata, error: metadataError } = await supabase
      .from('lead_metadata')
      .upsert({
        lead_id: leadId,
        user_id: user.id,
        organization_id: leadData.organization_id,
        is_favorited: isFavorited !== undefined ? isFavorited : false,
        note: note || null
      }, {
        onConflict: 'lead_id,user_id'
      })
      .select()
      .single()

    if (metadataError) {
      console.error('Error updating lead metadata:', metadataError)
      return NextResponse.json(
        { error: 'Failed to update lead metadata' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      metadata,
      message: 'Lead metadata updated successfully'
    })

  } catch (error) {
    console.error('Error updating lead metadata:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
