'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { EmptyState } from '../ui/empty-state'
import { LeadCard } from './lead-card'
import { 
  Search,
  Filter,
  Download,
  Copy,
  Grid3X3,
  List,
  Star,
  SortAsc,
  SortDesc,
  Check,
  FileDown,
  Mail,
  Users,
  Building2
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Lead } from '../../lib/types'
import { useToast } from '../ui/toast'
import { useLeads } from '../../lib/hooks/use-leads'

interface LeadResultsProps {
  leads: Lead[]
  organizationId: string // Keep for compatibility, but will use as userId
  loading?: boolean
  searchQuery?: string
  onSearchChange?: (query: string) => void
  className?: string
}

type ViewMode = 'grid' | 'list'
type SortField = 'business_name' | 'confidence_score' | 'created_at'
type SortOrder = 'asc' | 'desc'
type FilterType = 'all' | 'favorited' | 'with_email' | 'with_phone' | 'with_website'

interface LeadWithMeta extends Lead {
  isFavorited?: boolean
  note?: string
}

export function LeadResults({ 
  leads, 
  organizationId: userId,
  loading = false, 
  searchQuery = '', 
  onSearchChange,
  className 
}: LeadResultsProps) {
  const { addToast } = useToast()
  
  // Use leads hook for metadata management
  const { 
    metadata, 
    updateLeadMetadata, 
    copyAllEmails: copyEmails, 
    exportToCSV 
  } = useLeads({ organizationId: userId, autoLoad: false })
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortField, setSortField] = useState<SortField>('confidence_score')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [copiedEmails, setCopiedEmails] = useState(false)

  // Handle search input
  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value)
    if (onSearchChange) {
      onSearchChange(value)
    }
  }

  // Handle favorite toggle
  const handleFavorite = async (leadId: string, isFavorited: boolean) => {
    try {
      await updateLeadMetadata(leadId, { isFavorited })
      
      addToast({
        type: 'success',
        title: isFavorited ? 'Lead Favorited' : 'Lead Unfavorited',
        message: isFavorited ? 'Lead added to favorites' : 'Lead removed from favorites'
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error instanceof Error ? error.message : 'Failed to update favorite status'
      })
    }
  }

  // Handle note addition
  const handleAddNote = async (leadId: string, note: string) => {
    try {
      await updateLeadMetadata(leadId, { note })
      
      addToast({
        type: 'success',
        title: 'Note Saved',
        message: 'Lead note has been saved successfully'
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: error instanceof Error ? error.message : 'Failed to save note'
      })
    }
  }

  // Filter and sort leads
  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads.map(lead => ({
      ...lead,
      isFavorited: metadata[lead.id]?.isFavorited || false,
      note: metadata[lead.id]?.note || ''
    }))

    // Apply search filter
    if (localSearchQuery) {
      const query = localSearchQuery.toLowerCase()
      filtered = filtered.filter(lead => 
        lead.business_name.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.phone?.includes(query) ||
        lead.website?.toLowerCase().includes(query)
      )
    }

    // Apply type filter
    switch (filterType) {
      case 'favorited':
        filtered = filtered.filter(lead => lead.isFavorited)
        break
      case 'with_email':
        filtered = filtered.filter(lead => lead.email)
        break
      case 'with_phone':
        filtered = filtered.filter(lead => lead.phone)
        break
      case 'with_website':
        filtered = filtered.filter(lead => lead.website)
        break
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Handle null values
      if (aValue === null || aValue === undefined) aValue = ''
      if (bValue === null || bValue === undefined) bValue = ''

      // Convert to comparable values
      if (sortField === 'confidence_score') {
        aValue = aValue || 0
        bValue = bValue || 0
      } else if (sortField === 'created_at') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      } else {
        aValue = aValue.toString().toLowerCase()
        bValue = bValue.toString().toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [leads, localSearchQuery, filterType, sortField, sortOrder, metadata])

  // Copy all emails to clipboard
  const copyAllEmails = async () => {
    try {
      await copyEmails()
      setCopiedEmails(true)
      setTimeout(() => setCopiedEmails(false), 2000)
      
      addToast({
        type: 'success',
        title: 'Emails Copied',
        message: `${filteredAndSortedLeads.filter(lead => lead.email).length} email addresses copied to clipboard`
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Copy Failed',
        message: error instanceof Error ? error.message : 'Failed to copy emails to clipboard'
      })
    }
  }

  // Export to CSV
  const handleExportCSV = () => {
    try {
      exportToCSV(filteredAndSortedLeads)
      
      addToast({
        type: 'success',
        title: 'Export Complete',
        message: `${filteredAndSortedLeads.length} leads exported to CSV`
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: error instanceof Error ? error.message : 'Failed to export leads'
      })
    }
  }

  // Handle sort change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  // Get filter counts
  const filterCounts = useMemo(() => {
    const withEmail = leads.filter(lead => lead.email).length
    const withPhone = leads.filter(lead => lead.phone).length
    const withWebsite = leads.filter(lead => lead.website).length
    const favorited = Object.values(metadata).filter(meta => meta.isFavorited).length

    return { withEmail, withPhone, withWebsite, favorited }
  }, [leads, metadata])

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading leads...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (leads.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <EmptyState
            icon={Building2}
            title="No leads found"
            description="Try adjusting your search criteria or generate new leads"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Lead Results</span>
                <Badge variant="secondary">{filteredAndSortedLeads.length}</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredAndSortedLeads.length} of {leads.length} leads
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyAllEmails}
                disabled={filteredAndSortedLeads.filter(lead => lead.email).length === 0}
              >
                {copiedEmails ? (
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy Emails ({filteredAndSortedLeads.filter(lead => lead.email).length})
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={localSearchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All ({leads.length})
              </Button>
              <Button
                variant={filterType === 'favorited' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('favorited')}
              >
                <Star className="h-3 w-3 mr-1" />
                Favorited ({filterCounts.favorited})
              </Button>
              <Button
                variant={filterType === 'with_email' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('with_email')}
              >
                <Mail className="h-3 w-3 mr-1" />
                With Email ({filterCounts.withEmail})
              </Button>
            </div>

            {/* View Mode and Sort */}
            <div className="flex items-center space-x-2">
              {/* Sort */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort('business_name')}
                  className={cn(
                    sortField === 'business_name' && 'bg-muted'
                  )}
                >
                  Name
                  {sortField === 'business_name' && (
                    sortOrder === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort('confidence_score')}
                  className={cn(
                    sortField === 'confidence_score' && 'bg-muted'
                  )}
                >
                  Score
                  {sortField === 'confidence_score' && (
                    sortOrder === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
                  )}
                </Button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredAndSortedLeads.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={Search}
              title="No leads match your filters"
              description="Try adjusting your search or filter criteria"
            />
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" 
            : "space-y-4"
        )}>
          {filteredAndSortedLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onFavorite={handleFavorite}
              onAddNote={handleAddNote}
              isFavorited={lead.isFavorited}
              note={lead.note}
              className={viewMode === 'list' ? 'max-w-none' : ''}
            />
          ))}
        </div>
      )}
    </div>
  )
}