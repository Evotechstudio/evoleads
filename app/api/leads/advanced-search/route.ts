import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type UserSearch = Database['public']['Tables']['user_searches']['Row']
type UserSearchInsert = Database['public']['Tables']['user_searches']['Insert']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      organizationId,
      userId,
      businessType,
      country,
      state,
      city,
      leadsRequested,
      industry,
      companySize,
      locationRadius = 0,
      advancedFilters = {},
      saveSearch = false,
      searchName,
      alertEnabled = false,
      alertFrequency = 'weekly'
    } = body

    if (!organizationId || !userId || !businessType || !country || !city) {
      return NextResponse.json(
        { error: 'Missing required search parameters' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Create user search record
    const searchData: UserSearchInsert = {
      organization_id: organizationId,
      user_id: userId,
      business_type: businessType,
      country,
      state: state || '',
      city,
      leads_requested: leadsRequested,
      industry,
      company_size: companySize,
      location_radius: locationRadius,
      advanced_filters: advancedFilters,
      is_saved: saveSearch,
      search_name: saveSearch ? searchName : null,
      alert_enabled: saveSearch ? alertEnabled : false,
      alert_frequency: saveSearch && alertEnabled ? alertFrequency : null,
      status: 'processing'
    }

    const { data: userSearch, error: searchError } = await supabase
      .from('user_searches')
      .insert(searchData)
      .select()
      .single()

    if (searchError) {
      console.error('Error creating user search:', searchError)
      return NextResponse.json(
        { error: 'Failed to create search record' },
        { status: 500 }
      )
    }

    // If this is a saved search, create the saved search record
    let savedSearch = null
    if (saveSearch && searchName) {
      const { data: savedSearchData, error: savedSearchError } = await supabase
        .from('saved_searches')
        .insert({
          organization_id: organizationId,
          user_id: userId,
          name: searchName,
          search_criteria: {
            businessType,
            country,
            state,
            city,
            leadsRequested,
            industry,
            companySize,
            locationRadius,
            advancedFilters
          },
          alert_enabled: alertEnabled,
          alert_frequency: alertEnabled ? alertFrequency : null
        })
        .select()
        .single()

      if (savedSearchError) {
        console.error('Error creating saved search:', savedSearchError)
        // Don't fail the request, just log the error
      } else {
        savedSearch = savedSearchData

        // Create alert if enabled
        if (alertEnabled) {
          const { error: alertError } = await supabase
            .from('search_alerts')
            .insert({
              saved_search_id: savedSearch.id,
              organization_id: organizationId,
              user_id: userId,
              alert_type: 'new_leads',
              is_active: true
            })

          if (alertError) {
            console.error('Error creating search alert:', alertError)
          }
        }
      }
    }

    // Simulate lead generation process
    // In a real implementation, this would trigger the n8n webhook or external service
    const mockLeads = await generateMockLeads(userSearch, advancedFilters)

    // Insert generated leads
    if (mockLeads.length > 0) {
      const { error: leadsError } = await supabase
        .from('leads')
        .insert(mockLeads)

      if (leadsError) {
        console.error('Error inserting leads:', leadsError)
        // Update search status to failed
        await supabase
          .from('user_searches')
          .update({ status: 'failed' })
          .eq('id', userSearch.id)

        return NextResponse.json(
          { error: 'Failed to save generated leads' },
          { status: 500 }
        )
      }
    }

    // Update search status to completed
    const { error: updateError } = await supabase
      .from('user_searches')
      .update({ status: 'completed' })
      .eq('id', userSearch.id)

    if (updateError) {
      console.error('Error updating search status:', updateError)
    }

    // Update saved search results count
    if (savedSearch) {
      await supabase
        .from('saved_searches')
        .update({ 
          results_count: mockLeads.length,
          last_run_at: new Date().toISOString()
        })
        .eq('id', savedSearch.id)
    }

    return NextResponse.json({
      search: userSearch,
      savedSearch,
      leads: mockLeads,
      message: `Advanced search completed. Found ${mockLeads.length} leads.`
    })
  } catch (error) {
    console.error('Error in advanced search API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Mock lead generation function
// In a real implementation, this would call external APIs
async function generateMockLeads(userSearch: any, advancedFilters: any) {
  const leads = []
  const leadCount = Math.min(userSearch.leads_requested, Math.floor(Math.random() * userSearch.leads_requested) + 5)

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Real Estate', 'Retail',
    'Manufacturing', 'Education', 'Legal Services', 'Marketing', 'Consulting'
  ]

  const companySizes = ['startup', 'small', 'medium', 'large', 'enterprise']
  const verificationStatuses: ('verified' | 'unverified' | 'invalid')[] = ['verified', 'unverified', 'invalid']

  for (let i = 0; i < leadCount; i++) {
    const businessName = `${userSearch.business_type} Company ${i + 1}`
    const industry = userSearch.industry || industries[Math.floor(Math.random() * industries.length)]
    const companySize = userSearch.company_size || companySizes[Math.floor(Math.random() * companySizes.length)]
    
    // Apply advanced filters
    let includeEmail = true
    let includePhone = true
    let includeWebsite = true

    if (advancedFilters.has_email === false) includeEmail = Math.random() > 0.3
    if (advancedFilters.has_phone === false) includePhone = Math.random() > 0.4
    if (advancedFilters.has_website === false) includeWebsite = Math.random() > 0.2

    const confidenceScore = Math.random()
    const leadScore = Math.floor(Math.random() * 100)
    
    // Apply lead score filters
    if (advancedFilters.lead_score_min && leadScore < advancedFilters.lead_score_min) continue
    if (advancedFilters.lead_score_max && leadScore > advancedFilters.lead_score_max) continue

    const employeeCount = Math.floor(Math.random() * 1000) + 1
    const annualRevenue = Math.floor(Math.random() * 10000000) + 100000

    // Apply employee count filters
    if (advancedFilters.employee_count_min && employeeCount < advancedFilters.employee_count_min) continue
    if (advancedFilters.employee_count_max && employeeCount > advancedFilters.employee_count_max) continue

    // Apply revenue filters
    if (advancedFilters.annual_revenue_min && annualRevenue < advancedFilters.annual_revenue_min) continue
    if (advancedFilters.annual_revenue_max && annualRevenue > advancedFilters.annual_revenue_max) continue

    const lead = {
      organization_id: userSearch.organization_id,
      search_id: userSearch.id,
      business_name: businessName,
      email: includeEmail ? `contact@${businessName.toLowerCase().replace(/\s+/g, '')}.com` : null,
      phone: includePhone ? `+1-555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}` : null,
      website: includeWebsite ? `https://${businessName.toLowerCase().replace(/\s+/g, '')}.com` : null,
      confidence_score: confidenceScore,
      industry,
      company_size: companySize,
      employee_count: employeeCount,
      annual_revenue: annualRevenue,
      location_data: {
        city: userSearch.city,
        state: userSearch.state,
        country: userSearch.country,
        radius: userSearch.location_radius
      },
      social_profiles: {
        linkedin: Math.random() > 0.5 ? `https://linkedin.com/company/${businessName.toLowerCase().replace(/\s+/g, '-')}` : null,
        twitter: Math.random() > 0.7 ? `@${businessName.toLowerCase().replace(/\s+/g, '')}` : null
      },
      lead_score: leadScore,
      quality_score: confidenceScore * 0.8 + Math.random() * 0.2,
      verification_status: verificationStatuses[Math.floor(Math.random() * verificationStatuses.length)],
      tags: advancedFilters.tags || []
    }

    leads.push(lead)
  }

  return leads
}
