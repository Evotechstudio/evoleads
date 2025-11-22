import { supabase } from './supabase'
import type { Database } from './database.types'
import type {
  User,
  Organization,
  OrganizationMember,
  Lead,
  UserSearch,
  BillingHistory,
  Plan,
  SerpCache,
  UsageRecord,
} from './types'
import type { Json } from './database.types'

// Type aliases for database tables
type Tables = Database['public']['Tables']
type ProfileRow = Tables['profiles']['Row']
type OrganizationRow = Tables['organizations']['Row']
type OrganizationMemberRow = Tables['organization_members']['Row']
type LeadRow = Tables['leads']['Row']
type UserSearchRow = Tables['user_searches']['Row']
type BillingHistoryRow = Tables['billing_history']['Row']
type PlanRow = Tables['plans']['Row']
type SerpCacheRow = Tables['serp_cache']['Row']
type UsageRecordRow = Tables['usage_records']['Row']

// =============================================
// PROFILE OPERATIONS
// =============================================

export async function createProfile(user: {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
}): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating profile:', error)
    return null
  }

  return data as User
}

export async function getProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data as User
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<User, 'full_name' | 'avatar_url'>>
): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return null
  }

  return data as User
}

// =============================================
// ORGANIZATION OPERATIONS
// =============================================

export async function createOrganization(
  name: string,
  ownerId: string
): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .insert({
      name,
      owner_id: ownerId,
      plan: 'trial',
      credits: 0,
      trial_searches_used: 0,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating organization:', error)
    return null
  }

  return data as Organization
}

export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        organization_members!inner(user_id, role)
      `)
      .eq('organization_members.user_id', userId)

    if (error) {
      console.error('Error fetching user organizations:', error)
      return []
    }

    // Add role information to each organization
    const orgsWithRoles = data.map(org => ({
      ...org,
      role: org.organization_members?.[0]?.role || 'member'
    }))

    return orgsWithRoles as Organization[]
  } catch (error) {
    console.error('Unexpected error fetching user organizations:', error)
    return []
  }
}

export async function getOrganization(orgId: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()

  if (error) {
    console.error('Error fetching organization:', error)
    return null
  }

  return data as Organization
}

export async function updateOrganization(
  orgId: string,
  updates: Partial<Pick<Organization, 'name' | 'plan' | 'credits' | 'trial_searches_used'>>
): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', orgId)
    .select()
    .single()

  if (error) {
    console.error('Error updating organization:', error)
    return null
  }

  return data as Organization
}

export async function getOrganizationByInviteCode(inviteCode: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('invite_code', inviteCode)
    .single()

  if (error) {
    console.error('Error fetching organization by invite code:', error)
    return null
  }

  return data as Organization
}

// =============================================
// ORGANIZATION MEMBER OPERATIONS
// =============================================

export async function addOrganizationMember(
  organizationId: string,
  userId: string,
  role: 'owner' | 'admin' | 'member' = 'member'
): Promise<OrganizationMember | null> {
  const { data, error } = await supabase
    .from('organization_members')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      role,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding organization member:', error)
    return null
  }

  return data as OrganizationMember
}

export async function getOrganizationMembers(organizationId: string): Promise<(OrganizationMember & { profile: User })[]> {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      *,
      profiles:user_id (*)
    `)
    .eq('organization_id', organizationId)

  if (error) {
    console.error('Error fetching organization members:', error)
    return []
  }

  return data.map(member => ({
    ...member,
    profile: member.profiles as User,
  })) as (OrganizationMember & { profile: User })[]
}

export async function removeOrganizationMember(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('organization_id', organizationId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error removing organization member:', error)
    return false
  }

  return true
}

// =============================================
// SEARCH OPERATIONS
// =============================================

export async function createUserSearch(search: {
  organization_id: string
  user_id: string
  business_type: string
  country: string
  state: string
  city: string
  leads_requested: number
}): Promise<UserSearch | null> {
  const { data, error } = await supabase
    .from('user_searches')
    .insert(search)
    .select()
    .single()

  if (error) {
    console.error('Error creating user search:', error)
    return null
  }

  return data as UserSearch
}

export async function updateSearchStatus(
  searchId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed'
): Promise<UserSearch | null> {
  const { data, error } = await supabase
    .from('user_searches')
    .update({ status })
    .eq('id', searchId)
    .select()
    .single()

  if (error) {
    console.error('Error updating search status:', error)
    return null
  }

  return data as UserSearch
}

export async function getOrganizationSearches(organizationId: string): Promise<UserSearch[]> {
  const { data, error } = await supabase
    .from('user_searches')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching organization searches:', error)
    return []
  }

  return data as UserSearch[]
}

// =============================================
// LEAD OPERATIONS
// =============================================

export async function createLeads(leads: {
  organization_id: string
  search_id: string
  business_name: string
  email?: string | null
  phone?: string | null
  website?: string | null
  confidence_score?: number | null
}[]): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .insert(leads)
    .select()

  if (error) {
    console.error('Error creating leads:', error)
    return []
  }

  return data as Lead[]
}

export async function getSearchLeads(searchId: string): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('search_id', searchId)
    .order('confidence_score', { ascending: false, nullsFirst: false })

  if (error) {
    console.error('Error fetching search leads:', error)
    return []
  }

  return data as Lead[]
}

export async function getOrganizationLeads(organizationId: string): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching organization leads:', error)
    return []
  }

  return data as Lead[]
}

// =============================================
// BILLING OPERATIONS
// =============================================

export async function createBillingRecord(billing: {
  organization_id: string
  plan: string
  amount: number
  currency?: string
  payment_status?: string
  safepay_transaction_id?: string | null
}): Promise<BillingHistory | null> {
  const { data, error } = await supabase
    .from('billing_history')
    .insert(billing)
    .select()
    .single()

  if (error) {
    console.error('Error creating billing record:', error)
    return null
  }

  return data as BillingHistory
}

export async function updateBillingRecord(
  billingId: string,
  updates: Partial<Pick<BillingHistory, 'payment_status' | 'safepay_transaction_id'>>
): Promise<BillingHistory | null> {
  const { data, error } = await supabase
    .from('billing_history')
    .update(updates)
    .eq('id', billingId)
    .select()
    .single()

  if (error) {
    console.error('Error updating billing record:', error)
    return null
  }

  return data as BillingHistory
}

export async function getOrganizationBillingHistory(organizationId: string): Promise<BillingHistory[]> {
  const { data, error } = await supabase
    .from('billing_history')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching billing history:', error)
    return []
  }

  return data as BillingHistory[]
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

export async function checkUserOrganizationAccess(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('organization_members')
    .select('id')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    return false
  }

  return !!data
}

export async function isOrganizationOwner(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', organizationId)
    .eq('owner_id', userId)
    .single()

  if (error) {
    return false
  }

  return !!data
}

// =============================================
// PLAN OPERATIONS
// =============================================

export async function getPlans(): Promise<Plan[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('price', { ascending: true })

  if (error) {
    console.error('Error fetching plans:', error)
    return []
  }

  return data
}

export async function getPlan(planId: string): Promise<Plan | null> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('id', planId)
    .single()

  if (error) {
    console.error('Error fetching plan:', error)
    return null
  }

  return data
}

// =============================================
// SERP CACHE OPERATIONS
// =============================================

export async function getCachedSerpResults(queryHash: string): Promise<SerpCache | null> {
  const { data, error } = await supabase
    .from('serp_cache')
    .select('*')
    .eq('query_hash', queryHash)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error) {
    console.error('Error fetching cached SERP results:', error)
    return null
  }

  return data
}

export async function cacheSerpResults(
  queryHash: string,
  results: any,
  expiresAt: string
): Promise<SerpCache | null> {
  const { data, error } = await supabase
    .from('serp_cache')
    .insert({
      query_hash: queryHash,
      results,
      expires_at: expiresAt,
    })
    .select()
    .single()

  if (error) {
    console.error('Error caching SERP results:', error)
    return null
  }

  return data
}

// =============================================
// USAGE RECORD OPERATIONS
// =============================================

export async function createUsageRecord(usage: {
  organization_id: string
  user_id: string
  action_type: string
  credits_used: number
}): Promise<UsageRecord | null> {
  const { data, error } = await supabase
    .from('usage_records')
    .insert(usage)
    .select()
    .single()

  if (error) {
    console.error('Error creating usage record:', error)
    return null
  }

  return data
}

export async function getOrganizationUsage(
  organizationId: string,
  startDate?: string,
  endDate?: string
): Promise<UsageRecord[]> {
  let query = supabase
    .from('usage_records')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (startDate) {
    query = query.gte('created_at', startDate)
  }

  if (endDate) {
    query = query.lte('created_at', endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching organization usage:', error)
    return []
  }

  return data
}

export async function getUserUsage(
  userId: string,
  organizationId?: string,
  startDate?: string,
  endDate?: string
): Promise<UsageRecord[]> {
  let query = supabase
    .from('usage_records')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (organizationId) {
    query = query.eq('organization_id', organizationId)
  }

  if (startDate) {
    query = query.gte('created_at', startDate)
  }

  if (endDate) {
    query = query.lte('created_at', endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching user usage:', error)
    return []
  }

  return data
}