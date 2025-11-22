'use client'

import React from 'react'
import { LeadResults } from './lead-results'
import { Lead } from '../../lib/types'

// Demo data for testing
const demoLeads: Lead[] = [
  {
    id: '1',
    organization_id: 'demo-org',
    search_id: 'demo-search-1',
    business_name: 'Acme Restaurant',
    email: 'contact@acmerestaurant.com',
    phone: '+1 (555) 123-4567',
    website: 'https://acmerestaurant.com',
    confidence_score: 0.95,
    industry: 'Restaurant',
    company_size: 'small',
    employee_count: 25,
    annual_revenue: 500000,
    location_data: null,
    social_profiles: null,
    lead_score: 85,
    quality_score: 0.9,
    verification_status: 'verified',
    tags: ['restaurant', 'local'],
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    organization_id: 'demo-org',
    search_id: 'demo-search-1',
    business_name: 'Tech Solutions Inc',
    email: 'info@techsolutions.com',
    phone: '+1 (555) 987-6543',
    website: 'techsolutions.com',
    confidence_score: 0.87,
    industry: 'Technology',
    company_size: 'medium',
    employee_count: 150,
    annual_revenue: 2500000,
    location_data: null,
    social_profiles: null,
    lead_score: 78,
    quality_score: 0.82,
    verification_status: 'verified',
    tags: ['technology', 'b2b'],
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    organization_id: 'demo-org',
    search_id: 'demo-search-1',
    business_name: 'Local Fitness Center',
    email: null,
    phone: '+1 (555) 456-7890',
    website: 'https://localfitness.com',
    confidence_score: 0.72,
    industry: 'Fitness',
    company_size: 'small',
    employee_count: 12,
    annual_revenue: 300000,
    location_data: null,
    social_profiles: null,
    lead_score: 65,
    quality_score: 0.7,
    verification_status: 'unverified',
    tags: ['fitness', 'local'],
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    organization_id: 'demo-org',
    search_id: 'demo-search-2',
    business_name: 'Downtown Dental',
    email: 'appointments@downtowndental.com',
    phone: null,
    website: null,
    confidence_score: 0.91,
    industry: 'Healthcare',
    company_size: 'small',
    employee_count: 8,
    annual_revenue: 400000,
    location_data: null,
    social_profiles: null,
    lead_score: 88,
    quality_score: 0.91,
    verification_status: 'verified',
    tags: ['healthcare', 'dental'],
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    organization_id: 'demo-org',
    search_id: 'demo-search-2',
    business_name: 'Creative Marketing Agency',
    email: 'hello@creativemarketing.com',
    phone: '+1 (555) 321-0987',
    website: 'https://creativemarketing.com',
    confidence_score: 0.88,
    industry: 'Marketing',
    company_size: 'medium',
    employee_count: 45,
    annual_revenue: 1200000,
    location_data: null,
    social_profiles: null,
    lead_score: 82,
    quality_score: 0.85,
    verification_status: 'verified',
    tags: ['marketing', 'creative'],
    created_at: new Date().toISOString()
  }
]

interface LeadResultsDemoProps {
  organizationId?: string
  className?: string
}

export function LeadResultsDemo({ 
  organizationId = 'demo-org', 
  className 
}: LeadResultsDemoProps) {
  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Lead Results Demo</h2>
        <p className="text-muted-foreground">
          This is a demonstration of the lead results display and management functionality.
        </p>
      </div>
      
      <LeadResults
        leads={demoLeads}
        organizationId={organizationId}
        loading={false}
      />
    </div>
  )
}