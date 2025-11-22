// Credit calculation utilities for lead generation

export function calculateCreditsRequired(leadsRequested: number): number {
  // 1 credit = 100 leads (as per requirements)
  return Math.ceil(leadsRequested / 100)
}

export function calculateLeadCost(plan: string, leadsRequested: number): number {
  const baseCosts = {
    'trial': 0, // Free for trial
    'starter': 0.048, // ₨1,200 / 25,000 leads (250 credits * 100 leads)
    'growth': 0.05, // ₨4,000 / 80,000 leads (800 credits * 100 leads)
    'agency': 0.04 // ₨12,000 / 300,000 leads (3000 credits * 100 leads)
  }
  
  const costPerLead = baseCosts[plan as keyof typeof baseCosts] || 0
  return costPerLead * leadsRequested
}

export function getPlanLimits(plan: string) {
  const limits = {
    'trial': {
      maxSearches: 2,
      maxLeadsPerSearch: 20,
      totalLeads: 20,
      credits: 0,
      costPerMonth: 0
    },
    'starter': {
      maxSearches: Infinity,
      maxLeadsPerSearch: 500,
      totalLeads: 25000, // 250 credits * 100 leads
      credits: 250,
      costPerMonth: 1200
    },
    'growth': {
      maxSearches: Infinity,
      maxLeadsPerSearch: 500,
      totalLeads: 80000, // 800 credits * 100 leads
      credits: 800,
      costPerMonth: 4000
    },
    'agency': {
      maxSearches: Infinity,
      maxLeadsPerSearch: 500,
      totalLeads: 300000, // 3000 credits * 100 leads
      credits: 3000,
      costPerMonth: 12000
    }
  }
  
  return limits[plan as keyof typeof limits] || limits.trial
}

export function formatCreditsDisplay(credits: number): string {
  if (credits >= 1000) {
    return `${(credits / 1000).toFixed(1)}K`
  }
  return credits.toString()
}

export function formatLeadsDisplay(leads: number): string {
  if (leads >= 1000000) {
    return `${(leads / 1000000).toFixed(1)}M`
  }
  if (leads >= 1000) {
    return `${(leads / 1000).toFixed(1)}K`
  }
  return leads.toString()
}

export function calculateUsagePercentage(used: number, total: number): number {
  if (total === 0) return 0
  return Math.min(100, Math.round((used / total) * 100))
}

export function getUsageStatus(percentage: number): 'low' | 'medium' | 'high' | 'critical' {
  if (percentage >= 95) return 'critical'
  if (percentage >= 80) return 'high'
  if (percentage >= 50) return 'medium'
  return 'low'
}

export function estimateSearchDuration(leadsRequested: number): number {
  // Estimate in seconds based on leads requested
  const baseTime = 10 // 10 seconds base
  const timePerLead = 0.5 // 0.5 seconds per lead
  return Math.max(baseTime, leadsRequested * timePerLead)
}

export function generateSearchSummary(searchParams: {
  business_type: string
  country: string
  state: string
  city: string
  leads_requested: number
}): string {
  return `${searchParams.leads_requested} ${searchParams.business_type} businesses in ${searchParams.city}, ${searchParams.state}, ${searchParams.country}`
}

export function validateLeadData(lead: any): boolean {
  // Basic validation for lead data quality
  if (!lead.business_name || lead.business_name.trim().length < 2) {
    return false
  }
  
  // At least one contact method should be available
  const hasEmail = lead.email && isValidEmail(lead.email)
  const hasPhone = lead.phone && lead.phone.trim().length > 0
  const hasWebsite = lead.website && isValidUrl(lead.website)
  
  return hasEmail || hasPhone || hasWebsite
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isValidPhoneNumber(phone: string): boolean {
  // Basic phone number validation (international format)
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
  return phoneRegex.test(phone)
}

export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  return phone.replace(/[^\d+]/g, '')
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}

export function calculateSearchPriority(
  plan: string,
  creditsRemaining: number,
  leadsRequested: number
): 'high' | 'medium' | 'low' {
  const creditsRequired = calculateCreditsRequired(leadsRequested)
  
  if (plan === 'trial') return 'medium'
  if (plan === 'agency') return 'high'
  
  const creditRatio = creditsRemaining / creditsRequired
  if (creditRatio > 10) return 'high'
  if (creditRatio > 3) return 'medium'
  return 'low'
}

export function getRetryDelay(attemptNumber: number): number {
  // Exponential backoff with jitter
  const baseDelay = 1000 // 1 second
  const maxDelay = 30000 // 30 seconds
  const delay = Math.min(baseDelay * Math.pow(2, attemptNumber), maxDelay)
  const jitter = Math.random() * 0.1 * delay
  return delay + jitter
}

export function createRateLimitKey(userId: string, endpoint: string): string {
  return `rate_limit:${endpoint}:${userId}`
}

export function parseSearchFilters(filters: any) {
  return {
    minConfidenceScore: filters.minConfidenceScore || 0,
    hasEmail: filters.hasEmail || false,
    hasPhone: filters.hasPhone || false,
    hasWebsite: filters.hasWebsite || false,
    industry: filters.industry || null,
    sortBy: filters.sortBy || 'confidence_score',
    sortOrder: filters.sortOrder || 'desc'
  }
}

export function applyLeadFilters(leads: any[], filters: any) {
  let filteredLeads = [...leads]
  
  if (filters.minConfidenceScore > 0) {
    filteredLeads = filteredLeads.filter(lead => 
      (lead.confidence_score || 0) >= filters.minConfidenceScore
    )
  }
  
  if (filters.hasEmail) {
    filteredLeads = filteredLeads.filter(lead => 
      lead.email && isValidEmail(lead.email)
    )
  }
  
  if (filters.hasPhone) {
    filteredLeads = filteredLeads.filter(lead => 
      lead.phone && lead.phone.trim().length > 0
    )
  }
  
  if (filters.hasWebsite) {
    filteredLeads = filteredLeads.filter(lead => 
      lead.website && isValidUrl(lead.website)
    )
  }
  
  // Sort leads
  filteredLeads.sort((a, b) => {
    const aValue = a[filters.sortBy] || 0
    const bValue = b[filters.sortBy] || 0
    
    if (filters.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
  
  return filteredLeads
}