import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Search ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Delete the saved search (alerts will be deleted via CASCADE)
    const { error } = await supabase
      .from('saved_searches')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting saved search:', error)
      return NextResponse.json(
        { error: 'Failed to delete saved search' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Saved search deleted successfully' 
    })
  } catch (error) {
    console.error('Error in saved search DELETE API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      searchCriteria,
      alertEnabled,
      alertFrequency
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Search ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Update saved search
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (searchCriteria !== undefined) updateData.search_criteria = searchCriteria
    if (alertEnabled !== undefined) updateData.alert_enabled = alertEnabled
    if (alertFrequency !== undefined) updateData.alert_frequency = alertFrequency

    const { data: savedSearch, error: searchError } = await supabase
      .from('saved_searches')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (searchError) {
      console.error('Error updating saved search:', searchError)
      return NextResponse.json(
        { error: 'Failed to update saved search' },
        { status: 500 }
      )
    }

    // Handle alert updates
    if (alertEnabled !== undefined) {
      if (alertEnabled) {
        // Create or activate alert
        const { error: alertError } = await supabase
          .from('search_alerts')
          .upsert({
            saved_search_id: id,
            organization_id: savedSearch.organization_id,
            user_id: savedSearch.user_id,
            alert_type: 'new_leads',
            is_active: true
          })

        if (alertError) {
          console.error('Error updating search alert:', alertError)
        }
      } else {
        // Deactivate alert
        const { error: alertError } = await supabase
          .from('search_alerts')
          .update({ is_active: false })
          .eq('saved_search_id', id)

        if (alertError) {
          console.error('Error deactivating search alert:', alertError)
        }
      }
    }

    return NextResponse.json({ 
      savedSearch,
      message: 'Saved search updated successfully' 
    })
  } catch (error) {
    console.error('Error in saved search PUT API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}