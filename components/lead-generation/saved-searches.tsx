'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { EmptyState } from '../ui/empty-state'
import { useToast } from '../ui/toast'
import { 
  Search,
  Save,
  Bell,
  BellOff,
  Play,
  Edit,
  Trash2,
  Calendar,
  TrendingUp,
  Users,
  MapPin,
  Building2,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { SavedSearch, SearchAlert } from '../../lib/types'

interface SavedSearchesProps {
  organizationId: string
  className?: string
  onRunSearch?: (search: SavedSearch) => Promise<void>
  onEditSearch?: (search: SavedSearch) => void
}

interface SavedSearchWithAlert extends SavedSearch {
  alert?: SearchAlert
}

export function SavedSearches({ 
  organizationId, 
  className,
  onRunSearch,
  onEditSearch
}: SavedSearchesProps) {
  const { addToast } = useToast()
  
  // State
  const [searches, setSearches] = useState<SavedSearchWithAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [runningSearchId, setRunningSearchId] = useState<string | null>(null)

  // Load saved searches
  const loadSavedSearches = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/leads/saved-searches?organizationId=${organizationId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load saved searches')
      }

      setSearches(data.searches || [])
    } catch (error) {
      console.error('Failed to load saved searches:', error)
      addToast({
        type: 'error',
        title: 'Load Failed',
        message: error instanceof Error ? error.message : 'Failed to load saved searches'
      })
    } finally {
      setLoading(false)
    }
  }

  // Run a saved search
  const handleRunSearch = async (search: SavedSearchWithAlert) => {
    if (!onRunSearch) return
    
    try {
      setRunningSearchId(search.id)
      await onRunSearch(search)
      
      addToast({
        type: 'success',
        title: 'Search Started',
        message: `Running saved search: ${search.name}`
      })
      
      // Refresh searches to update last_run_at
      await loadSavedSearches()
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: error instanceof Error ? error.message : 'Failed to run search'
      })
    } finally {
      setRunningSearchId(null)
    }
  }

  // Toggle alert for a search
  const handleToggleAlert = async (search: SavedSearchWithAlert) => {
    try {
      const response = await fetch('/api/leads/search-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          savedSearchId: search.id,
          enabled: !search.alert_enabled
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to toggle alert')
      }

      // Update local state
      setSearches(prev => prev.map(s => 
        s.id === search.id 
          ? { ...s, alert_enabled: !s.alert_enabled, alert: data.alert }
          : s
      ))

      addToast({
        type: 'success',
        title: search.alert_enabled ? 'Alert Disabled' : 'Alert Enabled',
        message: search.alert_enabled 
          ? 'You will no longer receive alerts for this search'
          : 'You will now receive alerts when new leads are found'
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error instanceof Error ? error.message : 'Failed to update alert settings'
      })
    }
  }

  // Delete a saved search
  const handleDeleteSearch = async (search: SavedSearchWithAlert) => {
    if (!confirm(`Are you sure you want to delete "${search.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/leads/saved-searches/${search.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete search')
      }

      // Remove from local state
      setSearches(prev => prev.filter(s => s.id !== search.id))

      addToast({
        type: 'success',
        title: 'Search Deleted',
        message: `"${search.name}" has been deleted`
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: error instanceof Error ? error.message : 'Failed to delete search'
      })
    }
  }

  // Filter searches based on query
  const filteredSearches = searches.filter(search =>
    search.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    JSON.stringify(search.search_criteria).toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Load data on mount
  useEffect(() => {
    if (organizationId) {
      loadSavedSearches()
    }
  }, [organizationId])

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading saved searches...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Save className="h-5 w-5" />
                <span>Saved Searches</span>
                <Badge variant="secondary">{searches.length}</Badge>
              </CardTitle>
              <CardDescription>
                Manage and run your saved search configurations
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        {searches.length > 0 && (
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search saved searches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Saved Searches List */}
      {filteredSearches.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={Save}
              title={searches.length === 0 ? "No saved searches" : "No matching searches"}
              description={searches.length === 0 
                ? "Save your search configurations to quickly run them again later"
                : "Try adjusting your search query"
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSearches.map((search) => {
            const criteria = search.search_criteria as any
            const isRunning = runningSearchId === search.id
            
            return (
              <Card 
                key={search.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{search.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        {search.alert_enabled && (
                          <Badge variant="outline" className="text-xs">
                            <Bell className="h-3 w-3 mr-1" />
                            Alerts On
                          </Badge>
                        )}
                        {search.results_count !== null && (
                          <Badge variant="secondary" className="text-xs">
                            {search.results_count} leads
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleAlert(search)}
                        className="h-8 w-8 p-0"
                      >
                        {search.alert_enabled ? (
                          <Bell className="h-4 w-4 text-blue-600" />
                        ) : (
                          <BellOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      
                      {onEditSearch && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditSearch(search)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSearch(search)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Search Criteria Summary */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{criteria.business_type}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">
                        {criteria.city}, {criteria.state}, {criteria.country}
                      </span>
                    </div>
                    
                    {criteria.industry && (
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Industry:</span>
                        <span className="font-medium">{criteria.industry}</span>
                      </div>
                    )}
                    
                    {criteria.company_size && (
                      <div className="flex items-center space-x-2">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Size:</span>
                        <span className="font-medium capitalize">{criteria.company_size}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Filter className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Leads:</span>
                      <span className="font-medium">{criteria.leads_requested}</span>
                    </div>
                  </div>

                  {/* Last Run Info */}
                  {search.last_run_at && (
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground pt-2 border-t">
                      <Clock className="h-3 w-3" />
                      <span>Last run: {new Date(search.last_run_at).toLocaleDateString()}</span>
                    </div>
                  )}

                  {/* Alert Info */}
                  {search.alert_enabled && search.alert_frequency && (
                    <div className="flex items-center space-x-2 text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                      <Bell className="h-3 w-3" />
                      <span>Alerts: {search.alert_frequency}</span>
                    </div>
                  )}

                  {/* Run Button */}
                  <Button
                    onClick={() => handleRunSearch(search)}
                    disabled={isRunning || !onRunSearch}
                    className="w-full mt-4"
                    size="sm"
                  >
                    {isRunning ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-2" />
                        Run Search
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}