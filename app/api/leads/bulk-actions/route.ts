import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type BulkAction = Database['public']['Tables']['bulk_actions']['Row']
type BulkActionInsert = Database['public']['Tables']['bulk_actions']['Insert']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    if (!organizationId && !userId) {
      return NextResponse.json(
        { error: 'Organization ID or User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Build query
    let query = supabase
      .from('bulk_actions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50) // Limit to recent actions

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    } else if (userId) {
      query = query.eq('user_id', userId)
    }

    if (status && ['pending', 'processing', 'completed', 'failed'].includes(status)) {
      query = query.eq('status', status as 'pending' | 'processing' | 'completed' | 'failed')
    }

    const { data: actions, error } = await query

    if (error) {
      console.error('Error fetching bulk actions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch bulk actions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ actions: actions || [] })
  } catch (error) {
    console.error('Error in bulk actions API:', error)
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
      actionType,
      targetLeads,
      actionData = {}
    } = body

    if (!organizationId || !userId || !actionType || !targetLeads || targetLeads.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Create bulk action record
    const bulkActionData: BulkActionInsert = {
      organization_id: organizationId,
      user_id: userId,
      action_type: actionType,
      target_leads: targetLeads,
      action_data: actionData,
      status: 'processing'
    }

    const { data: bulkAction, error: actionError } = await supabase
      .from('bulk_actions')
      .insert(bulkActionData)
      .select()
      .single()

    if (actionError) {
      console.error('Error creating bulk action:', actionError)
      return NextResponse.json(
        { error: 'Failed to create bulk action' },
        { status: 500 }
      )
    }

    // Process the bulk action
    let results: any = {}
    let status: 'pending' | 'processing' | 'completed' | 'failed' = 'completed'

    try {
      switch (actionType) {
        case 'tag':
          results = await processBulkTag(supabase, targetLeads, actionData, userId)
          break
        case 'export':
          results = await processBulkExport(supabase, targetLeads, actionData, organizationId)
          break
        case 'delete':
          results = await processBulkDelete(supabase, targetLeads, organizationId)
          break
        case 'update_score':
          results = await processBulkUpdateScore(supabase, targetLeads)
          break
        case 'verify':
          results = await processBulkVerify(supabase, targetLeads)
          break
        default:
          throw new Error(`Unknown action type: ${actionType}`)
      }
    } catch (error) {
      console.error(`Error processing bulk action ${actionType}:`, error)
      status = 'failed'
      results = { error: error instanceof Error ? error.message : 'Unknown error' }
    }

    // Update bulk action with results
    const { error: updateError } = await supabase
      .from('bulk_actions')
      .update({
        status,
        results,
        completed_at: new Date().toISOString()
      })
      .eq('id', bulkAction.id)

    if (updateError) {
      console.error('Error updating bulk action:', updateError)
    }

    return NextResponse.json({ 
      bulkAction: { ...bulkAction, status, results },
      message: `Bulk ${actionType} ${status === 'completed' ? 'completed successfully' : 'failed'}`
    })
  } catch (error) {
    console.error('Error in bulk actions POST API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions for processing bulk actions

async function processBulkTag(supabase: any, leadIds: string[], actionData: any, userId: string) {
  const { tagIds } = actionData

  if (!tagIds || tagIds.length === 0) {
    throw new Error('No tags specified')
  }

  const assignments = leadIds.flatMap(leadId =>
    tagIds.map((tagId: string) => ({
      lead_id: leadId,
      tag_id: tagId,
      assigned_by: userId
    }))
  )

  const { data, error } = await supabase
    .from('lead_tag_assignments')
    .upsert(assignments, { onConflict: 'lead_id,tag_id' })

  if (error) {
    throw new Error(`Failed to assign tags: ${error.message}`)
  }

  return {
    tagged_leads: leadIds.length,
    tags_assigned: tagIds.length,
    total_assignments: assignments.length
  }
}

async function processBulkExport(supabase: any, leadIds: string[], actionData: any, organizationId: string) {
  const { format = 'csv' } = actionData

  // Fetch lead data
  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .in('id', leadIds)
    .eq('organization_id', organizationId)

  if (error) {
    throw new Error(`Failed to fetch leads for export: ${error.message}`)
  }

  // Generate export data based on format
  let exportData
  switch (format) {
    case 'csv':
      exportData = generateCSVExport(leads)
      break
    case 'excel':
      exportData = generateExcelExport(leads)
      break
    case 'json':
      exportData = JSON.stringify(leads, null, 2)
      break
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }

  return {
    exported_leads: leads.length,
    format,
    data_size: exportData.length,
    export_data: exportData
  }
}

async function processBulkDelete(supabase: any, leadIds: string[], organizationId: string) {
  // Delete leads (metadata and tag assignments will be deleted via CASCADE)
  const { error } = await supabase
    .from('leads')
    .delete()
    .in('id', leadIds)
    .eq('organization_id', organizationId)

  if (error) {
    throw new Error(`Failed to delete leads: ${error.message}`)
  }

  return {
    deleted_leads: leadIds.length
  }
}

async function processBulkUpdateScore(supabase: any, leadIds: string[]) {
  // Update lead scores using the database function
  const results = []
  
  for (const leadId of leadIds) {
    const { data, error } = await supabase
      .rpc('calculate_lead_score', { lead_id: leadId })

    if (error) {
      console.error(`Error calculating score for lead ${leadId}:`, error)
      continue
    }

    // Update the lead with the new score
    const { error: updateError } = await supabase
      .from('leads')
      .update({ lead_score: data })
      .eq('id', leadId)

    if (updateError) {
      console.error(`Error updating score for lead ${leadId}:`, updateError)
      continue
    }

    results.push({ lead_id: leadId, new_score: data })
  }

  return {
    updated_leads: results.length,
    failed_updates: leadIds.length - results.length,
    score_updates: results
  }
}

async function processBulkVerify(supabase: any, leadIds: string[]) {
  // This is a placeholder for lead verification logic
  // In a real implementation, you would integrate with email/phone verification services
  
  const results = []
  
  for (const leadId of leadIds) {
    // Simulate verification process
    const verificationStatus = Math.random() > 0.2 ? 'verified' : 'invalid'
    
    const { error } = await supabase
      .from('leads')
      .update({ verification_status: verificationStatus })
      .eq('id', leadId)

    if (error) {
      console.error(`Error verifying lead ${leadId}:`, error)
      continue
    }

    results.push({ lead_id: leadId, status: verificationStatus })
  }

  const verified = results.filter(r => r.status === 'verified').length
  const invalid = results.filter(r => r.status === 'invalid').length

  return {
    processed_leads: results.length,
    verified_leads: verified,
    invalid_leads: invalid,
    failed_verifications: leadIds.length - results.length,
    verification_results: results
  }
}

function generateCSVExport(leads: any[]) {
  const headers = [
    'Business Name',
    'Email',
    'Phone',
    'Website',
    'Industry',
    'Company Size',
    'Employee Count',
    'Annual Revenue',
    'Lead Score',
    'Confidence Score',
    'Verification Status',
    'Created Date'
  ]

  const csvContent = [
    headers.join(','),
    ...leads.map(lead => [
      `"${lead.business_name || ''}"`,
      `"${lead.email || ''}"`,
      `"${lead.phone || ''}"`,
      `"${lead.website || ''}"`,
      `"${lead.industry || ''}"`,
      `"${lead.company_size || ''}"`,
      lead.employee_count || '',
      lead.annual_revenue || '',
      lead.lead_score || '',
      lead.confidence_score || '',
      `"${lead.verification_status || ''}"`,
      `"${new Date(lead.created_at).toLocaleDateString()}"`
    ].join(','))
  ].join('\n')

  return csvContent
}

function generateExcelExport(leads: any[]) {
  // For simplicity, return CSV format
  // In a real implementation, you would generate actual Excel format
  return generateCSVExport(leads)
}
