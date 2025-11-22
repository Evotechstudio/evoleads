'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { EmptyState } from '../ui/empty-state'
import { BulkActions } from './bulk-actions'
import { useToast } from '../ui/toast'
import { 
  Search,
  Filter,
  Download,
  Grid3X3,
  List,
  Star,
  SortAsc,
  SortDesc,
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  MapPin,
  Mail,
  Phone,
  Globe,
  CheckCircle,
  AlertCircle,
  XCircle,
  Tag,
  Sliders,
  RotateCcw
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Lead, AdvancedSearchFilters, CompanySize, VerificationStatus } from '../../lib/types'

interface AdvancedLeadResultsProps {
  leads: Lead[]
  organizationId: string
  loading?: boolean
  searchQuery?: string
  onSearchChange?: (query: string) => void
  className?: string
  onLeadUpdate?: (leadId: string, updates: Partial<Lead>) => void
}

type ViewMode = 'grid' | 'list'
type SortField = 'business_name' | 'lead_score' | 'confidence_score' | 'created_at' | 'industry' | 'company_size'
type SortOrder = 'asc' | 'desc'

interface EnhancedLead extends Lead {
  isSelected?: boolean
}

export function AdvancedLeadResults({ 
  leads, 
  organizationId,
  loading = false, 
  searchQuery = '', 
  onSearchChange,
  className,
  onLeadUpdate
}: AdvancedLeadResultsProps) {
  const { addToast } = useToast()
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortField, setSortField] = useState<SortField>('lead_score')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  // Advanced Filters State
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedSearchFilters>({})

  // Handle search input
  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value)
    if (onSearchChange) {
      onSearchChange(value)
    }
  }

  // Handle advanced filter changes
  const handleAdvancedFilterChange = (field: keyof AdvancedSearchFilters, value: any) => {
    setAdvancedFilters(prev => ({ ...prev, [field]: value }))
  }

  // Clear all filters
  const clearAllFilters = () => {
    setAdvancedFilters({})
    setLocalSearchQuery('')
    if (onSearchChange) {
      onSearchChange('')
    }
  }

  // Filter and sort leads
  const filteredAndSortedLeads = useMemo(() => {
    let filtered = [...leads]

    // Apply text search filter
    if (localSearchQuery) {
      const query = localSearchQuery.toLowerCase()
      filtered = filtered.filter(lead => 
        lead.business_name.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.phone?.includes(query) ||
        lead.website?.toLowerCase().includes(query) ||
        lead.industry?.toLowerCase().includes(query)
      )
    }

    // Apply advanced filters
    if (advancedFilters.industry) {
      filtered = filtered.filter(lead => lead.industry === advancedFilters.industry)
    }

    if (advancedFilters.company_size) {
      filtered = filtered.filter(lead => lead.company_size === advancedFilters.company_size)
    }

    if (advancedFilters.verification_status) {
      filtered = filtered.filter(lead => lead.verification_status === advancedFilters.verification_status)
    }

    if (advancedFilters.has_email) {
      filtered = filtered.filter(lead => lead.email)
    }

    if (advancedFilters.has_phone) {
      filtered = filtered.filter(lead => lead.phone)
    }

    if (advancedFilters.has_website) {
      filtered = filtered.filter(lead => lead.website)
    }

    if (advancedFilters.lead_score_min !== undefined) {
      filtered = filtered.filter(lead => (lead.lead_score || 0) >= advancedFilters.lead_score_min!)
    }

    if (advancedFilters.lead_score_max !== undefined) {
      filtered = filtered.filter(lead => (lead.lead_score || 0) <= advancedFilters.lead_score_max!)
    }

    if (advancedFilters.employee_count_min !== undefined) {
      filtered = filtered.filter(lead => (lead.employee_count || 0) >= advancedFilters.employee_count_min!)
    }

    if (advancedFilters.employee_count_max !== undefined) {
      filtered = filtered.filter(lead => (lead.employee_count || 0) <= advancedFilters.employee_count_max!)
    }

    if (advancedFilters.annual_revenue_min !== undefined) {
      filtered = filtered.filter(lead => (lead.annual_revenue || 0) >= advancedFilters.annual_revenue_min!)
    }

    if (advancedFilters.annual_revenue_max !== undefined) {
      filtered = filtered.filter(lead => (lead.annual_revenue || 0) <= advancedFilters.annual_revenue_max!)
    }

    if (advancedFilters.tags && advancedFilters.tags.length > 0) {
      filtered = filtered.filter(lead => 
        lead.tags && advancedFilters.tags!.some(tag => lead.tags!.includes(tag))
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Handle null values
      if (aValue === null || aValue === undefined) aValue = sortField === 'lead_score' || sortField === 'confidence_score' ? 0 : ''
      if (bValue === null || bValue === undefined) bValue = sortField === 'lead_score' || sortField === 'confidence_score' ? 0 : ''

      // Convert to comparable values
      if (sortField === 'created_at') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [leads, localSearchQuery, advancedFilters, sortField, sortOrder])

  // Handle sort change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  // Get filter statistics
  const filterStats = useMemo(() => {
    const withEmail = leads.filter(lead => lead.email).length
    const withPhone = leads.filter(lead => lead.phone).length
    const withWebsite = leads.filter(lead => lead.website).length
    const verified = leads.filter(lead => lead.verification_status === 'verified').length
    const highScore = leads.filter(lead => (lead.lead_score || 0) >= 70).length

    return { withEmail, withPhone, withWebsite, verified, highScore }
  }, [leads])

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const industries = [...new Set(leads.map(lead => lead.industry).filter(Boolean))]
    const companySizes = [...new Set(leads.map(lead => lead.company_size).filter(Boolean))]
    const tags = [...new Set(leads.flatMap(lead => lead.tags || []))]

    return { industries, companySizes, tags }
  }, [leads])

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
                <span>Advanced Lead Results</span>
                <Badge variant="secondary">{filteredAndSortedLeads.length}</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredAndSortedLeads.length} of {leads.length} leads
                {selectedLeads.length > 0 && ` • ${selectedLeads.length} selected`}
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Mail className="h-4 w-4 text-blue-500" />
                <span>{filterStats.withEmail}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4 text-green-500" />
                <span>{filterStats.withPhone}</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>{filterStats.verified}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{filterStats.highScore}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads by name, email, phone, website, or industry..."
                value={localSearchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={cn(showAdvancedFilters && "bg-muted")}
            >
              <Sliders className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
            {(Object.keys(advancedFilters).length > 0 || localSearchQuery) && (
              <Button variant="outline" onClick={clearAllFilters}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-4">
                <h4 className="font-medium flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </h4>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Industry Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Industry</label>
                    <select
                      value={advancedFilters.industry || ''}
                      onChange={(e) => handleAdvancedFilterChange('industry', e.target.value || undefined)}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value="">All Industries</option>
                      {filterOptions.industries.filter(industry => industry !== null).map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>

                  {/* Company Size Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Size</label>
                    <select
                      value={advancedFilters.company_size || ''}
                      onChange={(e) => handleAdvancedFilterChange('company_size', e.target.value || undefined)}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value="">All Sizes</option>
                      <option value="startup">Startup</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>

                  {/* Verification Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Verification Status</label>
                    <select
                      value={advancedFilters.verification_status || ''}
                      onChange={(e) => handleAdvancedFilterChange('verification_status', e.target.value || undefined)}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value="">All Status</option>
                      <option value="verified">Verified</option>
                      <option value="unverified">Unverified</option>
                      <option value="invalid">Invalid</option>
                    </select>
                  </div>
                </div>

                {/* Lead Score Range */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Min Lead Score</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={advancedFilters.lead_score_min || ''}
                      onChange={(e) => handleAdvancedFilterChange('lead_score_min', 
                        e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Lead Score</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="100"
                      value={advancedFilters.lead_score_max || ''}
                      onChange={(e) => handleAdvancedFilterChange('lead_score_max', 
                        e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                </div>

                {/* Contact Requirements */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Required Contact Information</label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={advancedFilters.has_email ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAdvancedFilterChange('has_email', !advancedFilters.has_email)}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Email ({filterStats.withEmail})
                    </Button>
                    <Button
                      type="button"
                      variant={advancedFilters.has_phone ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAdvancedFilterChange('has_phone', !advancedFilters.has_phone)}
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Phone ({filterStats.withPhone})
                    </Button>
                    <Button
                      type="button"
                      variant={advancedFilters.has_website ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAdvancedFilterChange('has_website', !advancedFilters.has_website)}
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      Website ({filterStats.withWebsite})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sort and View Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              {[
                { field: 'lead_score' as SortField, label: 'Lead Score' },
                { field: 'confidence_score' as SortField, label: 'Confidence' },
                { field: 'business_name' as SortField, label: 'Name' },
                { field: 'created_at' as SortField, label: 'Date' }
              ].map(({ field, label }) => (
                <Button
                  key={field}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort(field)}
                  className={cn(sortField === field && 'bg-muted')}
                >
                  {label}
                  {sortField === field && (
                    sortOrder === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
                  )}
                </Button>
              ))}
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
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <BulkActions
        leads={filteredAndSortedLeads}
        selectedLeads={selectedLeads}
        onSelectionChange={setSelectedLeads}
        organizationId={organizationId}
        onActionComplete={() => {
          // Refresh leads data
          addToast({
            type: 'success',
            title: 'Data Refreshed',
            message: 'Lead data has been updated'
          })
        }}
      />

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
            <EnhancedLeadCard
              key={lead.id}
              lead={lead}
              isSelected={selectedLeads.includes(lead.id)}
              onSelect={() => {
                if (selectedLeads.includes(lead.id)) {
                  setSelectedLeads(prev => prev.filter(id => id !== lead.id))
                } else {
                  setSelectedLeads(prev => [...prev, lead.id])
                }
              }}
              onUpdate={onLeadUpdate}
              className={viewMode === 'list' ? 'max-w-none' : ''}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Enhanced Lead Card Component
interface EnhancedLeadCardProps {
  lead: Lead
  isSelected: boolean
  onSelect: () => void
  onUpdate?: (leadId: string, updates: Partial<Lead>) => void
  className?: string
}

function EnhancedLeadCard({ lead, isSelected, onSelect, onUpdate, className }: EnhancedLeadCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getVerificationIcon = (status: VerificationStatus | null) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'invalid': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary bg-primary/5",
        className
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{lead.business_name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                {lead.industry && (
                  <Badge variant="outline" className="text-xs">
                    {lead.industry}
                  </Badge>
                )}
                {lead.company_size && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {lead.company_size}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {lead.verification_status && getVerificationIcon(lead.verification_status)}
              {lead.lead_score && (
                <Badge className={cn("text-xs", getScoreColor(lead.lead_score))}>
                  {lead.lead_score}
                </Badge>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-1 text-sm">
            {lead.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span className="truncate">{lead.email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span>{lead.phone}</span>
              </div>
            )}
            {lead.website && (
              <div className="flex items-center space-x-2">
                <Globe className="h-3 w-3 text-muted-foreground" />
                <span className="truncate">{lead.website}</span>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              {lead.employee_count && (
                <span>{lead.employee_count} employees</span>
              )}
              {lead.annual_revenue && (
                <span>${(lead.annual_revenue / 1000000).toFixed(1)}M revenue</span>
              )}
            </div>
            
            {lead.confidence_score && (
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3" />
                <span>{Math.round(lead.confidence_score * 100)}% confidence</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {lead.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="h-2 w-2 mr-1" />
                  {tag}
                </Badge>
              ))}
              {lead.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{lead.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}