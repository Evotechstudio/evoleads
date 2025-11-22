'use client'

import { useState, useEffect, useCallback } from 'react'
import { Lead, UserSearch } from '../types'

interface LeadMetadata {
  isFavorited: boolean
  note: string | null
}

interface UseLeadsOptions {
  organizationId: string
  searchId?: string
  autoLoad?: boolean
}

interface UseLeadsReturn {
  leads: Lead[]
  searches: UserSearch[]
  metadata: Record<string, LeadMetadata>
  loading: boolean
  error: string | null
  refreshLeads: () => Promise<void>
  refreshSearches: () => Promise<void>
  updateLeadMetadata: (leadId: string, updates: Partial<LeadMetadata>) => Promise<void>
  copyAllEmails: () => Promise<void>
  exportToCSV: (leads: Lead[]) => void
}

export function useLeads({ 
  organizationId, 
  searchId, 
  autoLoad = true 
}: UseLeadsOptions): UseLeadsReturn {
  const [leads, setLeads] = useState<Lead[]>([])
  const [searches, setSearches] = useState<UserSearch[]>([])
  const [metadata, setMetadata] = useState<Record<string, LeadMetadata>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    if (!organizationId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        userId: organizationId, // Using organizationId as userId
        ...(searchId && { searchId })
      })

      const response = await fetch(`/api/leads?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leads')
      }

      setLeads(data.leads || [])

      // Fetch metadata for these leads
      if (data.leads && data.leads.length > 0) {
        await fetchLeadMetadata(data.leads.map((lead: Lead) => lead.id))
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }, [organizationId, searchId])

  // Fetch searches
  const fetchSearches = useCallback(async () => {
    if (!organizationId) return

    try {
      const params = new URLSearchParams({ userId: organizationId }) // Using organizationId as userId
      const response = await fetch(`/api/leads/searches?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch searches')
      }

      setSearches(data.searches || [])
    } catch (err) {
      console.error('Failed to fetch searches:', err)
    }
  }, [organizationId])

  // Fetch lead metadata
  const fetchLeadMetadata = useCallback(async (leadIds: string[]) => {
    if (!organizationId || leadIds.length === 0) return

    try {
      const params = new URLSearchParams({
        userId: organizationId, // Using organizationId as userId for compatibility
        leadIds: leadIds.join(',')
      })

      const response = await fetch(`/api/leads/metadata?${params}`)
      const data = await response.json()

      if (response.ok) {
        setMetadata(data.metadata || {})
      }
    } catch (err) {
      console.error('Failed to fetch lead metadata:', err)
    }
  }, [organizationId])

  // Update lead metadata
  const updateLeadMetadata = useCallback(async (
    leadId: string, 
    updates: Partial<LeadMetadata>
  ) => {
    try {
      const response = await fetch('/api/leads/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          ...updates
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update lead metadata')
      }

      // Update local metadata
      setMetadata(prev => ({
        ...prev,
        [leadId]: {
          isFavorited: data.metadata.isFavorited,
          note: data.metadata.note
        }
      }))

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update lead metadata')
    }
  }, [])

  // Copy all emails to clipboard
  const copyAllEmails = useCallback(async () => {
    const emails = leads
      .filter(lead => lead.email)
      .map(lead => lead.email)
      .join(', ')

    if (emails) {
      await navigator.clipboard.writeText(emails)
      return
    }

    throw new Error('No email addresses found')
  }, [leads])

  // Export leads to CSV
  const exportToCSV = useCallback((leadsToExport: Lead[]) => {
    if (leadsToExport.length === 0) {
      throw new Error('No leads to export')
    }

    const headers = [
      'Business Name',
      'Email',
      'Phone',
      'Website',
      'Confidence Score',
      'Favorited',
      'Note',
      'Created Date'
    ]

    const csvContent = [
      headers.join(','),
      ...leadsToExport.map(lead => {
        const leadMetadata = metadata[lead.id]
        return [
          `"${lead.business_name}"`,
          `"${lead.email || ''}"`,
          `"${lead.phone || ''}"`,
          `"${lead.website || ''}"`,
          lead.confidence_score || '',
          leadMetadata?.isFavorited ? 'Yes' : 'No',
          `"${leadMetadata?.note || ''}"`,
          `"${new Date(lead.created_at).toLocaleDateString()}"`
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `leads-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [metadata])

  // Auto-load data on mount
  useEffect(() => {
    if (autoLoad && organizationId) {
      fetchLeads()
      fetchSearches()
    }
  }, [autoLoad, organizationId, fetchLeads, fetchSearches])

  return {
    leads,
    searches,
    metadata,
    loading,
    error,
    refreshLeads: fetchLeads,
    refreshSearches: fetchSearches,
    updateLeadMetadata,
    copyAllEmails,
    exportToCSV
  }
}