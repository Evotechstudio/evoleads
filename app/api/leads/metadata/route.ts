import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase'
import { checkUserOrganizationAccess } from '../../../../lib/database'

// Get lead metadata for user
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
    const organizationId = url.searchParams.get('organizationId')
    const userId = url.searchParams.get('userId')
    const leadIds = url.searchParams.get('leadIds')?.split(',')

    // Support both organizationId (legacy) and userId (new)
    const targetId = userId || organizationId

    if (!targetId) {
      return NextResponse.json(
        { error: 'User ID or Organization ID is required' },
        { status: 400 }
      )
    }

    // Verify access based on the parameter used
    if (organizationId && !userId) {
      const hasAccess = await checkUserOrganizationAccess(user.id, organizationId)
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied to organization' },
          { status: 403 }
        )
      }
    } else if (userId && userId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied - can only access your own data' },
        { status: 403 }
      )
    }

    // Build query
    let query = supabase
      .from('lead_metadata')
      .select('*')
      .eq('user_id', user.id)

    // Filter by organization_id or user context
    if (organizationId && !userId) {
      query = query.eq('organization_id', organizationId)
    }
    // For userId, we don't need additional filtering since we already filter by user_id

    // Filter by specific lead IDs if provided
    if (leadIds && leadIds.length > 0) {
      query = query.in('lead_id', leadIds)
    }

    const { data: metadata, error: metadataError } = await query

    if (metadataError) {
      console.error('Error fetching lead metadata:', metadataError)
      return NextResponse.json(
        { error: 'Failed to fetch lead metadata' },
        { status: 500 }
      )
    }

    // Convert to a map for easier lookup
    const metadataMap = (metadata || []).reduce((acc, item) => {
      acc[item.lead_id] = {
        isFavorited: item.is_favorited || false,
        note: item.note || null
      }
      return acc
    }, {} as Record<string, { isFavorited: boolean; note: string | null }>)

    return NextResponse.json({
      success: true,
      metadata: metadataMap
    })

  } catch (error) {
    console.error('Error in lead metadata API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update lead metadata
export async function POST(req: NextRequest) {
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

    // For user-based system, check if the lead belongs to the user's searches
    const { data: searchData } = await supabase
      .from('user_searches')
      .select('user_id')
      .eq('id', (await supabase.from('leads').select('search_id').eq('id', leadId).single()).data?.search_id || '')
      .single()

    if (!searchData || searchData.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied to this lead' },
        { status: 403 }
      )
    }

    // Prepare update data
    const updateData: any = {
      lead_id: leadId,
      user_id: user.id,
      organization_id: leadData.organization_id || user.id // Use user.id as fallback
    }

    if (isFavorited !== undefined) {
      updateData.is_favorited = isFavorited
    }

    if (note !== undefined) {
      updateData.note = note || null
    }

    // Upsert lead metadata
    const { data: metadata, error: metadataError } = await supabase
      .from('lead_metadata')
      .upsert(updateData, {
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
      metadata: {
        leadId: metadata.lead_id,
        isFavorited: metadata.is_favorited,
        note: metadata.note
      },
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

// Delete lead metadata
export async function DELETE(req: NextRequest) {
  const supabase = createServerClient()
  
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const leadId = url.searchParams.get('leadId')

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    // Delete lead metadata
    const { error: deleteError } = await supabase
      .from('lead_metadata')
      .delete()
      .eq('lead_id', leadId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting lead metadata:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete lead metadata' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Lead metadata deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting lead metadata:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
