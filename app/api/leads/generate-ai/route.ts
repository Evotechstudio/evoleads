import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase'
import { 
  createUserSearch, 
  updateSearchStatus, 
  createLeads, 
  getOrganization, 
  updateOrganization,
  checkUserOrganizationAccess,
  getCachedSerpResults,
  cacheSerpResults,
  createUsageRecord
} from '../../../../lib/database'
import { generateLeadsWithAI } from '../../../../lib/lead-generation/ai-service'
import { validateSearchRequest } from '../../../../lib/lead-generation/validation'
import { calculateCreditsRequired } from '../../../../lib/lead-generation/utils'
import { createHash } from 'crypto'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await req.json()
    const validationResult = validateSearchRequest(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.errors },
        { status: 400 }
      )
    }

    const { business_type, country, state, city, leads_requested, organization_id } = validationResult.data!

    // Verify user has access to the organization
    const hasAccess = await checkUserOrganizationAccess(user.id, organization_id)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to organization' },
        { status: 403 }
      )
    }

    // Get organization details
    const organization = await getOrganization(organization_id)
    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Calculate credits required
    const creditsRequired = calculateCreditsRequired(leads_requested)

    // Check usage limits and credits
    const usageCheck = checkUsageLimits(organization, creditsRequired)
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { error: usageCheck.message },
        { status: 403 }
      )
    }

    // Create search record
    const searchRecord = await createUserSearch({
      organization_id,
      user_id: user.id,
      business_type,
      country,
      state,
      city,
      leads_requested
    })

    if (!searchRecord) {
      return NextResponse.json(
        { error: 'Failed to create search record' },
        { status: 500 }
      )
    }

    // Update search status to processing
    await updateSearchStatus(searchRecord.id, 'processing')

    // Check cache first
    const queryHash = createQueryHash({ business_type, country, state, city, leads_requested })
    const cachedResults = await getCachedSerpResults(queryHash)

    let leads: any[] = []

    if (cachedResults && cachedResults.results) {
      // Use cached results
      leads = Array.isArray(cachedResults.results) ? cachedResults.results : []
    } else {
      // Generate new leads using AI service
      try {
        leads = await generateLeadsWithAI({
          business_type,
          country,
          state,
          city,
          leads_requested
        })

        // Cache the results for 24 hours
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        await cacheSerpResults(queryHash, leads, expiresAt)
      } catch (aiError) {
        console.error('AI lead generation failed:', aiError)
        await updateSearchStatus(searchRecord.id, 'failed')
        return NextResponse.json(
          { error: 'Lead generation service temporarily unavailable' },
          { status: 503 }
        )
      }
    }

    // Process and score leads
    const processedLeads = leads.slice(0, leads_requested).map(lead => ({
      organization_id,
      search_id: searchRecord.id,
      business_name: lead.business_name || lead.name || 'Unknown Business',
      email: lead.email || null,
      phone: lead.phone || null,
      website: lead.website || null,
      confidence_score: calculateConfidenceScore(lead)
    }))

    // Save leads to database
    const savedLeads = await createLeads(processedLeads)

    // Update organization credits/usage
    const updatedOrganization = await updateOrganizationUsage(organization, creditsRequired)
    
    // Create usage record
    await createUsageRecord({
      organization_id,
      user_id: user.id,
      action_type: 'lead_generation',
      credits_used: creditsRequired
    })

    // Update search status to completed
    await updateSearchStatus(searchRecord.id, 'completed')

    // Return response
    return NextResponse.json({
      success: true,
      search_id: searchRecord.id,
      leads: savedLeads,
      usage: {
        leads_generated: savedLeads.length,
        credits_used: creditsRequired,
        remaining_credits: updatedOrganization?.credits || 0,
        plan: organization.plan,
        trial_searches_remaining: organization.plan === 'trial' 
          ? Math.max(0, 2 - (organization.trial_searches_used + 1))
          : null
      }
    })

  } catch (error) {
    console.error('Error in lead generation API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function createQueryHash(params: {
  business_type: string
  country: string
  state: string
  city: string
  leads_requested: number
}): string {
  const queryString = `${params.business_type}-${params.country}-${params.state}-${params.city}-${params.leads_requested}`
  return createHash('sha256').update(queryString.toLowerCase()).digest('hex')
}

function checkUsageLimits(organization: any, creditsRequired: number) {
  // Trial plan limits
  if (organization.plan === 'trial') {
    if (organization.trial_searches_used >= 2) {
      return {
        allowed: false,
        message: 'Trial limit reached. You have used all 2 free searches. Please upgrade to continue.'
      }
    }
    return { allowed: true }
  }

  // Paid plan credit limits
  if (organization.credits < creditsRequired) {
    return {
      allowed: false,
      message: `Insufficient credits. You need ${creditsRequired} credits but only have ${organization.credits} remaining.`
    }
  }

  return { allowed: true }
}

function calculateConfidenceScore(lead: any): number {
  let score = 50 // Base score

  // Increase score based on available data
  if (lead.email && lead.email.includes('@')) score += 25
  if (lead.phone) score += 15
  if (lead.website) score += 10
  
  // Additional scoring based on data quality
  if (lead.business_name && lead.business_name.length > 3) score += 10
  if (lead.address || lead.location) score += 5
  
  // Ensure score is between 0 and 100
  return Math.min(100, Math.max(0, score))
}

async function updateOrganizationUsage(organization: any, creditsUsed: number) {
  const updates: any = {}

  if (organization.plan === 'trial') {
    updates.trial_searches_used = organization.trial_searches_used + 1
  } else {
    updates.credits = Math.max(0, organization.credits - creditsUsed)
  }

  return await updateOrganization(organization.id, updates)
}
