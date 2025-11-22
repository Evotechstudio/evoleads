'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'
import { 
  AdvancedSearchForm,
  SavedSearches,
  AdvancedLeadResults
} from '@/components/lead-generation'
import { 
  Search,
  Save,
  History,
  TrendingUp,
  Users,
  Target,
  Zap,
  Star,
  Filter
} from 'lucide-react'
import { AdvancedSearchRequest, SavedSearch, Lead } from '@/lib/types'

export default function AdvancedSearchPage() {
  const { addToast } = useToast()
  
  // State
  const [activeTab, setActiveTab] = useState('search')
  const [searchResults, setSearchResults] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [organizationId] = useState('demo-org-id') // In real app, get from auth context
  const [userId] = useState('demo-user-id') // In real app, get from auth context
  const [searchQuery, setSearchQuery] = useState('')

  // Plan info state
  const [planInfo, setPlanInfo] = useState<{
    leadsAvailable: number
    canMakeRequest: boolean
  }>({
    leadsAvailable: 0,
    canMakeRequest: false
  })

  // Fetch plan info
  useEffect(() => {
    const fetchPlanInfo = async () => {
      try {
        const response = await fetch('/api/user/plan-info')
        if (response.ok) {
          const data = await response.json()
          setPlanInfo({
            leadsAvailable: data.leadsAvailable,
            canMakeRequest: data.canMakeRequest
          })
        }
      } catch (error) {
        console.error('Error fetching plan info:', error)
      }
    }

    fetchPlanInfo()
  }, [])

  // Handle advanced search submission
  const handleAdvancedSearch = async (searchData: AdvancedSearchRequest) => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/leads/advanced-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          userId,
          businessType: searchData.business_type,
          country: searchData.country,
          state: searchData.state,
          city: searchData.city,
          leadsRequested: searchData.leads_requested,
          industry: searchData.industry,
          companySize: searchData.company_size,
          locationRadius: searchData.location_radius,
          advancedFilters: searchData.advanced_filters,
          saveSearch: searchData.save_search,
          searchName: searchData.search_name,
          alertEnabled: searchData.alert_enabled,
          alertFrequency: searchData.alert_frequency
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      setSearchResults(data.leads || [])
      setActiveTab('results')

      addToast({
        type: 'success',
        title: 'Search Completed!',
        message: `Found ${data.leads?.length || 0} leads matching your criteria${searchData.save_search ? ' and saved search' : ''}`
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle saved search execution
  const handleRunSavedSearch = async (savedSearch: SavedSearch) => {
    try {
      setLoading(true)
      
      const criteria = savedSearch.search_criteria as any
      
      const response = await fetch('/api/leads/advanced-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          userId,
          ...criteria
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      setSearchResults(data.leads || [])
      setActiveTab('results')

      addToast({
        type: 'success',
        title: 'Saved Search Executed!',
        message: `Found ${data.leads?.length || 0} leads for "${savedSearch.name}"`
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: error instanceof Error ? error.message : 'Failed to execute saved search'
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle lead updates
  const handleLeadUpdate = async (leadId: string, updates: Partial<Lead>) => {
    try {
      // Update local state
      setSearchResults(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, ...updates } : lead
      ))

      addToast({
        type: 'success',
        title: 'Lead Updated',
        message: 'Lead information has been updated successfully'
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error instanceof Error ? error.message : 'Failed to update lead'
      })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <span>Advanced Lead Search</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Use advanced filters and AI-powered search to find highly targeted business leads
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Remaining Leads</div>
            <div className="text-2xl font-bold text-primary">{remainingLeads}</div>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <Zap className="h-3 w-3 mr-1" />
            Pro Plan
          </Badge>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Filter className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold">Advanced Filters</h3>
            <p className="text-sm text-muted-foreground">Industry, company size, revenue, and more</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Save className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold">Saved Searches</h3>
            <p className="text-sm text-muted-foreground">Save and rerun your search configurations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="font-semibold">Lead Scoring</h3>
            <p className="text-sm text-muted-foreground">AI-powered lead quality assessment</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold">Bulk Actions</h3>
            <p className="text-sm text-muted-foreground">Tag, export, and manage leads in bulk</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Advanced Search</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Saved Searches</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Results ({searchResults.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Advanced Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <AdvancedSearchForm
            onSearchSubmit={handleAdvancedSearch}
            canMakeRequest={planInfo.canMakeRequest}
            remainingLeads={planInfo.leadsAvailable}
          />
        </TabsContent>

        {/* Saved Searches Tab */}
        <TabsContent value="saved" className="space-y-6">
          <SavedSearches
            organizationId={organizationId}
            onRunSearch={handleRunSavedSearch}
          />
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          {searchResults.length > 0 ? (
            <AdvancedLeadResults
              leads={searchResults}
              organizationId={organizationId}
              loading={loading}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onLeadUpdate={handleLeadUpdate}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Search Results</h3>
                <p className="text-muted-foreground mb-6">
                  Run an advanced search to see results here
                </p>
                <Button onClick={() => setActiveTab('search')}>
                  <Search className="h-4 w-4 mr-2" />
                  Start Advanced Search
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6">
            <CardContent className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <div>
                <h3 className="font-semibold">Processing Advanced Search</h3>
                <p className="text-sm text-muted-foreground">
                  Applying filters and generating targeted leads...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}