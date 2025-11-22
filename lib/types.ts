// Core Types for Evo Lead AI

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Organization {
  id: string
  name: string
  owner_id: string
  plan: 'trial' | 'starter' | 'growth' | 'agency'
  credits: number
  trial_searches_used: number
  invite_code: string
  created_at: string
  role?: 'owner' | 'admin' | 'member' // User's role in this organization
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
}

export interface Lead {
  id: string
  organization_id: string
  search_id: string
  business_name: string
  email: string | null
  phone: string | null
  website: string | null
  confidence_score: number | null
  industry: string | null
  company_size: string | null
  employee_count: number | null
  annual_revenue: number | null
  location_data: Json | null
  social_profiles: Json | null
  lead_score: number | null
  quality_score: number | null
  verification_status: 'unverified' | 'verified' | 'invalid' | null
  tags: string[] | null
  created_at: string
}

export interface UserSearch {
  id: string
  organization_id: string
  user_id: string
  business_type: string
  country: string
  state: string
  city: string
  leads_requested: 30 | 100 | 300 | 500
  status: 'pending' | 'processing' | 'completed' | 'failed'
  industry: string | null
  company_size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | null
  location_radius: number | null
  advanced_filters: Json | null
  is_saved: boolean | null
  search_name: string | null
  alert_enabled: boolean | null
  alert_frequency: 'daily' | 'weekly' | 'monthly' | null
  created_at: string
}

export interface BillingHistory {
  id: string
  organization_id: string
  plan: string
  amount: number
  currency: string
  payment_status: string
  safepay_transaction_id: string | null
  created_at: string
}

import type { Json } from './database.types'

export interface Plan {
  id: string
  name: string
  price: number
  credits: number
  features: Json
  created_at: string
}

export interface SerpCache {
  id: string
  query_hash: string
  results: Json
  created_at: string
  expires_at: string
}

export interface UsageRecord {
  id: string
  organization_id: string
  user_id: string
  action_type: string
  credits_used: number
  created_at: string
}

// Form Types
export interface SearchRequest {
  business_type: string
  country: string
  state: string
  city: string
  leads_requested: 30 | 100 | 300 | 500
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// Context Types
export interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>
  signOut: () => Promise<void>
}

export interface OrganizationContextType {
  activeOrganization: Organization | null
  userOrganizations: Organization[]
  loading: boolean
  switchOrganization: (orgId: string) => void
  createOrganization: (name: string) => Promise<Organization>
  joinOrganization: (inviteCode: string) => Promise<void>
  refreshOrganizations: () => Promise<void>
}

// Advanced Search Types
export interface SavedSearch {
  id: string
  organization_id: string
  user_id: string
  name: string
  search_criteria: Json
  alert_enabled: boolean | null
  alert_frequency: 'daily' | 'weekly' | 'monthly' | null
  last_run_at: string | null
  results_count: number | null
  created_at: string
  updated_at: string
}

export interface SearchAlert {
  id: string
  saved_search_id: string
  organization_id: string
  user_id: string
  alert_type: 'new_leads' | 'threshold_reached' | 'scheduled'
  trigger_criteria: Json | null
  is_active: boolean | null
  last_triggered_at: string | null
  created_at: string
}

export interface LeadTag {
  id: string
  organization_id: string
  name: string
  color: string | null
  description: string | null
  created_by: string | null
  created_at: string
}

export interface LeadTagAssignment {
  id: string
  lead_id: string
  tag_id: string
  assigned_by: string | null
  assigned_at: string
}

export interface BulkAction {
  id: string
  organization_id: string
  user_id: string
  action_type: 'tag' | 'export' | 'delete' | 'update_score' | 'verify'
  target_leads: string[]
  action_data: Json | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  results: Json | null
  created_at: string
  completed_at: string | null
}

export interface ExportTemplate {
  id: string
  organization_id: string
  user_id: string
  name: string
  field_mapping: Json
  export_format: 'csv' | 'excel' | 'json'
  is_default: boolean | null
  created_at: string
  updated_at: string
}

// Advanced Search Form Types
export interface AdvancedSearchFilters {
  industry?: string
  company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  location_radius?: number
  employee_count_min?: number
  employee_count_max?: number
  annual_revenue_min?: number
  annual_revenue_max?: number
  verification_status?: 'unverified' | 'verified' | 'invalid'
  lead_score_min?: number
  lead_score_max?: number
  has_email?: boolean
  has_phone?: boolean
  has_website?: boolean
  tags?: string[]
}

export interface AdvancedSearchRequest extends SearchRequest {
  industry?: string
  company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  location_radius?: number
  advanced_filters?: AdvancedSearchFilters
  save_search?: boolean
  search_name?: string
  alert_enabled?: boolean
  alert_frequency?: 'daily' | 'weekly' | 'monthly'
}

// Utility Types
export type PlanType = Organization['plan']
export type SearchStatus = UserSearch['status']
export type MemberRole = OrganizationMember['role']
export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
export type VerificationStatus = 'unverified' | 'verified' | 'invalid'
export type AlertFrequency = 'daily' | 'weekly' | 'monthly'
export type BulkActionType = 'tag' | 'export' | 'delete' | 'update_score' | 'verify'
export type ExportFormat = 'csv' | 'excel' | 'json'
