import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type SearchAlert = Database['public']['Tables']['search_alerts']['Row']
type SearchAlertInsert = Database['public']['Tables']['search_alerts']['Insert']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const userId = searchParams.get('userId')
    const savedSearchId = searchParams.get('savedSearchId')

    if (!organizationId && !userId) {
      return NextResponse.json(
        { error: 'Organization ID or User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Build query
    let query = supabase
      .from('search_alerts')
      .select(`
        *,
        saved_searches (
          id,
          name,
          search_criteria
        )
      `)
      .order('created_at', { ascending: false })

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    } else if (userId) {
      query = query.eq('user_id', userId)
    }

    if (savedSearchId) {
      query = query.eq('saved_search_id', savedSearchId)
    }

    const { data: alerts, error } = await query

    if (error) {
      console.error('Error fetching search alerts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch search alerts' },
        { status: 500 }
      )
    }

    return NextResponse.json({ alerts: alerts || [] })
  } catch (error) {
    console.error('Error in search alerts API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      savedSearchId,
      organizationId,
      userId,
      alertType = 'new_leads',
      triggerCriteria = {},
      enabled = true
    } = body

    if (!savedSearchId) {
      return NextResponse.json(
        { error: 'Saved search ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get saved search details if organizationId/userId not provided
    let orgId = organizationId
    let usrId = userId

    if (!orgId || !usrId) {
      const { data: savedSearch, error: searchError } = await supabase
        .from('saved_searches')
        .select('organization_id, user_id')
        .eq('id', savedSearchId)
        .single()

      if (searchError || !savedSearch) {
        return NextResponse.json(
          { error: 'Saved search not found' },
          { status: 404 }
        )
      }

      orgId = savedSearch.organization_id
      usrId = savedSearch.user_id
    }

    // Check if alert already exists
    const { data: existingAlert } = await supabase
      .from('search_alerts')
      .select('id')
      .eq('saved_search_id', savedSearchId)
      .single()

    let alert
    if (existingAlert) {
      // Update existing alert
      const { data: updatedAlert, error: updateError } = await supabase
        .from('search_alerts')
        .update({
          is_active: enabled,
          alert_type: alertType,
          trigger_criteria: triggerCriteria
        })
        .eq('id', existingAlert.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating search alert:', updateError)
        return NextResponse.json(
          { error: 'Failed to update search alert' },
          { status: 500 }
        )
      }

      alert = updatedAlert
    } else {
      // Create new alert
      const alertData: SearchAlertInsert = {
        saved_search_id: savedSearchId,
        organization_id: orgId,
        user_id: usrId,
        alert_type: alertType,
        trigger_criteria: triggerCriteria,
        is_active: enabled
      }

      const { data: newAlert, error: createError } = await supabase
        .from('search_alerts')
        .insert(alertData)
        .select()
        .single()

      if (createError) {
        console.error('Error creating search alert:', createError)
        return NextResponse.json(
          { error: 'Failed to create search alert' },
          { status: 500 }
        )
      }

      alert = newAlert
    }

    return NextResponse.json({ 
      alert,
      message: 'Search alert updated successfully' 
    })
  } catch (error) {
    console.error('Error in search alerts POST API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
