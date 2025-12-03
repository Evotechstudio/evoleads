'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { LeadResults } from './lead-results'
import { 
  RefreshCw,
  Download,
  FileSpreadsheet,
  Mail,
  Filter,
  Calendar,
  TrendingUp,
  Users,
  Building2,
  Star
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Lead, UserSearch } from '../../lib/types'
import { useToast } from '../ui/toast'

interface LeadManagementProps {
  organizationId: string // Keep for compatibility, but will use as userId
  className?: string
}

interface SearchWithLeads extends UserSearch {
  leads: Lead[]
  lead_count: number
}

export function LeadManagement({ organizationId: userId, className }: LeadManagementProps) {
  const { addToast } = useToast()
  
  // State
  const [searches, setSearches] = useState<SearchWithLeads[]>([])
  const [selectedSearchId, setSelectedSearchId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalSearches: 0,
    leadsWithEmail: 0,
    avgConfidence: 0
  })

  // Get current leads from selected search
  const currentLeads = selectedSearchId 
    ? searches.find(s => s.id === selectedSearchId)?.leads || []
    : searches.flatMap(s => s.leads)

  // Load searches and leads
  const loadSearches = async () => {
    try {
      setLoading(true)
      
      // Fetch user searches (using userId instead of organizationId)
      const searchesResponse = await fetch(`/api/leads/searches?userId=${userId}`)
      const searchesData = await searchesResponse.json()

      if (!searchesResponse.ok) {
        throw new Error(searchesData.error || 'Failed to load searches')
      }

      // Set searches with lead counts from API
      const searchesWithCounts = searchesData.searches.map((search: any) => ({
        ...search,
        leads: [],
        lead_count: search.leads_count || search.leads_found || 0
      }))

      setSearches(searchesWithCounts)
      
      // Fetch aggregated stats
      const statsResponse = await fetch('/api/leads/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
      
      // Auto-select the most recent search if none selected
      if (!selectedSearchId && searchesWithCounts.length > 0) {
        setSelectedSearchId(searchesWithCounts[0].id)
      }
      
    } catch (error) {
      console.error('Failed to load searches:', error)
      addToast({
        type: 'error',
        title: 'Load Failed',
        message: error instanceof Error ? error.message : 'Failed to load lead data'
      })
    } finally {
      setLoading(false)
    }
  }

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadSearches()
    setRefreshing(false)
    
    addToast({
      type: 'success',
      title: 'Data Refreshed',
      message: 'Lead data has been updated'
    })
  }

  // Export all leads to CSV
  const exportAllLeads = () => {
    const allLeads = searches.flatMap(s => s.leads)
    
    if (allLeads.length === 0) {
      addToast({
        type: 'error',
        title: 'No Data',
        message: 'No leads available to export'
      })
      return
    }

    const headers = [
      'Search Date',
      'Business Type', 
      'Location',
      'Business Name', 
      'Rating',
      'Reviews',
      'Address',
      'Email', 
      'Phone', 
      'Website', 
      'Confidence Score'
    ]
    
    const csvContent = [
      headers.join(','),
      ...allLeads.map(lead => {
        const search = searches.find(s => s.id === lead.search_id)
        return [
          `"${new Date(lead.created_at).toLocaleDateString()}"`,
          `"${search?.business_type || ''}"`,
          `"${search ? `${search.city}, ${search.state}, ${search.country}` : ''}"`,
          `"${lead.business_name}"`,
          `"${lead.rating || ''}"`,
          `"${lead.review_count || ''}"`,
          `"${lead.address || ''}"`,
          `"${lead.email || ''}"`,
          `"${lead.phone || ''}"`,
          `"${lead.website || ''}"`,
          lead.confidence_score || ''
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `all-leads-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    addToast({
      type: 'success',
      title: 'Export Complete',
      message: `${allLeads.length} leads exported to CSV`
    })
  }

  // Export to Excel format (enhanced CSV)
  const exportToExcel = () => {
    const allLeads = searches.flatMap(s => s.leads)
    
    if (allLeads.length === 0) {
      addToast({
        type: 'error',
        title: 'No Data',
        message: 'No leads available to export'
      })
      return
    }

    // Create more detailed Excel-compatible format
    const headers = [
      'Search ID',
      'Search Date',
      'Business Type',
      'Country',
      'State/Province',
      'City',
      'Leads Requested',
      'Business Name',
      'Rating',
      'Review Count',
      'Address',
      'Email Address',
      'Phone Number',
      'Website URL',
      'Confidence Score (%)',
      'Lead Created Date'
    ]
    
    const csvContent = [
      headers.join(','),
      ...allLeads.map(lead => {
        const search = searches.find(s => s.id === lead.search_id)
        return [
          `"${lead.search_id}"`,
          `"${search ? new Date(search.created_at).toLocaleDateString() : ''}"`,
          `"${search?.business_type || ''}"`,
          `"${search?.country || ''}"`,
          `"${search?.state || ''}"`,
          `"${search?.city || ''}"`,
          search?.leads_requested || '',
          `"${lead.business_name}"`,
          `"${lead.rating || ''}"`,
          `"${lead.review_count || ''}"`,
          `"${lead.address || ''}"`,
          `"${lead.email || ''}"`,
          `"${lead.phone || ''}"`,
          `"${lead.website || ''}"`,
          lead.confidence_score ? Math.round(lead.confidence_score * 100) : '',
          `"${new Date(lead.created_at).toLocaleDateString()}"`
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `leads-detailed-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    addToast({
      type: 'success',
      title: 'Detailed Export Complete',
      message: `${allLeads.length} leads exported with full details`
    })
  }

  // Stats are now fetched from API and stored in state
  // Remove the useMemo calculation

  // Load data on mount
  useEffect(() => {
    loadSearches()
  }, [userId])

  return (
    <div className={cn("space-y-6", className)}>
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalLeads}</p>
                <p className="text-xs text-muted-foreground">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalSearches}</p>
                <p className="text-xs text-muted-foreground">Searches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.leadsWithEmail}</p>
                <p className="text-xs text-muted-foreground">With Email</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.avgConfidence}%</p>
                <p className="text-xs text-muted-foreground">Avg Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search History and Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Search History</span>
            </CardTitle>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className={cn("h-4 w-4 sm:mr-2", refreshing && "animate-spin")} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={exportAllLeads}
                disabled={stats.totalLeads === 0}
                className="flex-1 sm:flex-none"
              >
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">CSV</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={exportToExcel}
                disabled={stats.totalLeads === 0}
                className="flex-1 sm:flex-none"
              >
                <FileSpreadsheet className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Excel</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading searches...</span>
            </div>
          ) : searches.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No searches yet</h3>
              <p className="text-muted-foreground">Start by generating your first batch of leads</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 mb-4">
                <Button
                  variant={selectedSearchId === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSearchId(null)}
                >
                  All Searches ({stats.totalLeads} leads)
                </Button>
              </div>
              
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {searches.map((search) => (
                  <Card 
                    key={search.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md hover:ring-2 hover:ring-primary",
                      selectedSearchId === search.id && "ring-2 ring-primary"
                    )}
                    onClick={() => {
                      // Navigate to search leads page
                      console.log('Navigating to search:', search.id, search);
                      if (search.id) {
                        window.location.href = `/dashboard/leads/${search.id}`;
                      } else {
                        alert('Error: Search ID is missing');
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant={search.status === 'completed' ? 'default' : 'secondary'}>
                            {search.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(search.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm">{search.business_type}</h4>
                          <p className="text-xs text-muted-foreground">
                            {search.city}, {search.state}, {search.country}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Requested: {search.leads_requested}
                          </span>
                          <span className="font-medium text-green-600">
                            Found: {search.lead_count || 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Results */}
      {!loading && currentLeads.length > 0 && (
        <LeadResults
          leads={currentLeads}
          organizationId={userId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}
    </div>
  )
}