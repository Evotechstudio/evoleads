import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type SavedSearch = Database['public']['Tables']['saved_searches']['Row']
type SavedSearchInsert = Database['public']['Tables']['saved_searches']['Insert']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const userId = searchParams.get('userId')

    if (!organizationId && !userId) {
      return NextResponse.json(
        { error: 'Organization ID or User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Build query
    let query = supabase
      .from('saved_searches')
      .select(`
        *,
        search_alerts (
          id,
          alert_type,
          is_active,
          last_triggered_at
        )
      `)
      .order('updated_at', { ascending: false })

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    } else if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: searches, error } = await query

    if (error) {
      console.error('Error fetching saved searches:', error)
      return NextResponse.json(
        { error: 'Failed to fetch saved searches' },
        { status: 500 }
      )
    }

    return NextResponse.json({ searches: searches || [] })
  } catch (error) {
    console.error('Error in saved searches API:', error)
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
      organizationId,
      userId,
      name,
      searchCriteria,
      alertEnabled = false,
      alertFrequency = 'weekly'
    } = body

    if (!organizationId || !userId || !name || !searchCriteria) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Create saved search
    const savedSearchData: SavedSearchInsert = {
      organization_id: organizationId,
      user_id: userId,
      name,
      search_criteria: searchCriteria,
      alert_enabled: alertEnabled,
      alert_frequency: alertFrequency
    }

    const { data: savedSearch, error: searchError } = await supabase
      .from('saved_searches')
      .insert(savedSearchData)
      .select()
      .single()

    if (searchError) {
      console.error('Error creating saved search:', searchError)
      return NextResponse.json(
        { error: 'Failed to create saved search' },
        { status: 500 }
      )
    }

    // Create alert if enabled
    let alert = null
    if (alertEnabled && savedSearch) {
      const { data: alertData, error: alertError } = await supabase
        .from('search_alerts')
        .insert({
          saved_search_id: savedSearch.id,
          organization_id: organizationId,
          user_id: userId,
          alert_type: 'new_leads',
          is_active: true
        })
        .select()
        .single()

      if (alertError) {
        console.error('Error creating search alert:', alertError)
        // Don't fail the request, just log the error
      } else {
        alert = alertData
      }
    }

    return NextResponse.json({ 
      savedSearch,
      alert,
      message: 'Saved search created successfully' 
    })
  } catch (error) {
    console.error('Error in saved searches POST API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
