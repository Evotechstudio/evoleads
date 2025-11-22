'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { FormField, FormGroup, Select } from '../ui/form'
import { useToast } from '../ui/toast'
import { 
  Search, 
  MapPin, 
  Building2,
  Users,
  ArrowRight,
  Target,
  AlertCircle,
  Loader2,
  Globe,
  Map,
  Filter,
  Save,
  Bell,
  Sliders,
  TrendingUp,
  DollarSign,
  Mail,
  Phone,
  Globe2,
  Tag,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { AdvancedSearchRequest, AdvancedSearchFilters, CompanySize } from '../../lib/types'

// Industry options
const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Real Estate',
  'Retail',
  'Manufacturing',
  'Education',
  'Legal Services',
  'Marketing & Advertising',
  'Consulting',
  'Construction',
  'Transportation',
  'Food & Beverage',
  'Entertainment',
  'Non-profit',
  'Government',
  'Energy',
  'Agriculture',
  'Telecommunications',
  'Automotive'
]

// Company size options
const COMPANY_SIZES: { value: CompanySize; label: string; description: string }[] = [
  { value: 'startup', label: 'Startup', description: '1-10 employees' },
  { value: 'small', label: 'Small', description: '11-50 employees' },
  { value: 'medium', label: 'Medium', description: '51-200 employees' },
  { value: 'large', label: 'Large', description: '201-1000 employees' },
  { value: 'enterprise', label: 'Enterprise', description: '1000+ employees' }
]

// Location radius options
const LOCATION_RADIUS_OPTIONS = [
  { value: 0, label: 'Exact location only' },
  { value: 5, label: 'Within 5 km' },
  { value: 10, label: 'Within 10 km' },
  { value: 25, label: 'Within 25 km' },
  { value: 50, label: 'Within 50 km' },
  { value: 100, label: 'Within 100 km' }
]

interface AdvancedSearchFormProps {
  onSearchSubmit?: (data: AdvancedSearchRequest) => Promise<void>
  onSaveSearch?: (data: AdvancedSearchRequest) => Promise<void>
  className?: string
  canMakeRequest?: boolean
  remainingLeads?: number
}

export function AdvancedSearchForm({ 
  onSearchSubmit, 
  onSaveSearch,
  className,
  canMakeRequest = true,
  remainingLeads = 0
}: AdvancedSearchFormProps) {
  const { addToast } = useToast()
  
  // Form state
  const [formData, setFormData] = useState<AdvancedSearchRequest>({
    business_type: '',
    country: '',
    state: '',
    city: '',
    leads_requested: 30,
    industry: '',
    company_size: undefined,
    location_radius: 0,
    advanced_filters: {},
    save_search: false,
    search_name: '',
    alert_enabled: false,
    alert_frequency: 'weekly'
  })
  
  // Advanced filters state
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedSearchFilters>({})
  
  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchProgress, setSearchProgress] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Handle field changes
  const handleFieldChange = (field: keyof AdvancedSearchRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Handle advanced filter changes
  const handleAdvancedFilterChange = (field: keyof AdvancedSearchFilters, value: any) => {
    setAdvancedFilters(prev => ({ ...prev, [field]: value }))
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.business_type) {
      newErrors.business_type = 'Business type is required'
    }
    
    if (!formData.country) {
      newErrors.country = 'Country is required'
    }
    
    if (!formData.city) {
      newErrors.city = 'City is required'
    }
    
    if (formData.leads_requested > remainingLeads) {
      newErrors.leads_requested = `Not enough leads remaining. You have ${remainingLeads} leads left.`
    }
    
    if (formData.save_search && !formData.search_name) {
      newErrors.search_name = 'Search name is required when saving'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors below and try again.'
      })
      return
    }

    setIsSubmitting(true)
    setSearchProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 15
        })
      }, 200)

      // Prepare search data with advanced filters
      const searchData: AdvancedSearchRequest = {
        ...formData,
        advanced_filters: advancedFilters
      }

      // Submit search
      if (onSearchSubmit) {
        await onSearchSubmit(searchData)
      }

      // Save search if requested
      if (formData.save_search && onSaveSearch) {
        await onSaveSearch(searchData)
      }

      clearInterval(progressInterval)
      setSearchProgress(100)
      
      addToast({
        type: 'success',
        title: 'Search Completed!',
        message: `Advanced search completed${formData.save_search ? ' and saved' : ''}`
      })
      
      // Reset form after successful submission
      setTimeout(() => {
        setSearchProgress(0)
        setIsSubmitting(false)
      }, 1000)

    } catch (error) {
      setSearchProgress(0)
      setIsSubmitting(false)
      
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    }
  }

  return (
    <Card className={cn("border-0 shadow-2xl bg-card/50 backdrop-blur hover:shadow-3xl transition-all duration-500", className)}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center space-x-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Sliders className="h-6 w-6 text-primary" />
          </div>
          <span>Advanced Lead Search</span>
        </CardTitle>
        <CardDescription className="text-base">
          Use advanced filters to find highly targeted business leads
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Search Fields */}
          <FormGroup>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Business Type */}
              <FormField
                label="Business Type"
                required
                error={errors.business_type}
              >
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g., Restaurants, Law Firms, Tech Companies"
                    value={formData.business_type}
                    onChange={(e) => handleFieldChange('business_type', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </FormField>

              {/* Industry */}
              <FormField
                label="Industry"
                error={errors.industry}
              >
                <div className="relative">
                  <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Select
                    options={[
                      { value: '', label: 'Any industry' },
                      ...INDUSTRIES.map(industry => ({ value: industry, label: industry }))
                    ]}
                    placeholder="Select industry..."
                    value={formData.industry || ''}
                    onChange={(e) => handleFieldChange('industry', e.target.value || undefined)}
                    className="pl-10"
                  />
                </div>
              </FormField>
            </div>

            {/* Location Fields */}
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                label="Country"
                required
                error={errors.country}
              >
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g., United States, Canada"
                    value={formData.country}
                    onChange={(e) => handleFieldChange('country', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </FormField>

              <FormField
                label="State/Province"
                error={errors.state}
              >
                <div className="relative">
                  <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g., California, Ontario"
                    value={formData.state}
                    onChange={(e) => handleFieldChange('state', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </FormField>

              <FormField
                label="City"
                required
                error={errors.city}
              >
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g., San Francisco, Toronto"
                    value={formData.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </FormField>
            </div>

            {/* Company Size and Location Radius */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Company Size"
                error={errors.company_size}
              >
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Select
                    options={[
                      { value: '', label: 'Any size' },
                      ...COMPANY_SIZES.map(size => ({ 
                        value: size.value, 
                        label: `${size.label} (${size.description})` 
                      }))
                    ]}
                    placeholder="Select company size..."
                    value={formData.company_size || ''}
                    onChange={(e) => handleFieldChange('company_size', e.target.value || undefined)}
                    className="pl-10"
                  />
                </div>
              </FormField>

              <FormField
                label="Location Radius"
                error={errors.location_radius}
              >
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Select
                    options={LOCATION_RADIUS_OPTIONS.map(option => ({ 
                      value: option.value.toString(), 
                      label: option.label 
                    }))}
                    placeholder="Select radius..."
                    value={formData.location_radius?.toString() || '0'}
                    onChange={(e) => handleFieldChange('location_radius', parseInt(e.target.value))}
                    className="pl-10"
                  />
                </div>
              </FormField>
            </div>

            {/* Lead Volume */}
            <FormField
              label="Number of Leads"
              required
              error={errors.leads_requested}
              description={`You have ${remainingLeads} leads remaining`}
            >
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Select
                  options={[
                    { value: '30', label: '30 leads' },
                    { value: '100', label: '100 leads' },
                    { value: '300', label: '300 leads' },
                    { value: '500', label: '500 leads' }
                  ].map(option => ({
                    ...option,
                    disabled: parseInt(option.value) > remainingLeads
                  }))}
                  placeholder="Select number of leads..."
                  value={formData.leads_requested.toString()}
                  onChange={(e) => handleFieldChange('leads_requested', parseInt(e.target.value))}
                  className="pl-10"
                />
              </div>
            </FormField>
          </FormGroup>

          {/* Advanced Filters Toggle */}
          <div className="border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-4">
                <h4 className="font-medium flex items-center">
                  <Sliders className="h-4 w-4 mr-2" />
                  Advanced Filters
                </h4>

                {/* Employee Count Range */}
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Min Employees">
                    <Input
                      type="number"
                      placeholder="e.g., 10"
                      value={advancedFilters.employee_count_min || ''}
                      onChange={(e) => handleAdvancedFilterChange('employee_count_min', 
                        e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormField>

                  <FormField label="Max Employees">
                    <Input
                      type="number"
                      placeholder="e.g., 500"
                      value={advancedFilters.employee_count_max || ''}
                      onChange={(e) => handleAdvancedFilterChange('employee_count_max', 
                        e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormField>
                </div>

                {/* Revenue Range */}
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Min Annual Revenue ($)">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="e.g., 1000000"
                        value={advancedFilters.annual_revenue_min || ''}
                        onChange={(e) => handleAdvancedFilterChange('annual_revenue_min', 
                          e.target.value ? parseInt(e.target.value) : undefined)}
                        className="pl-10"
                      />
                    </div>
                  </FormField>

                  <FormField label="Max Annual Revenue ($)">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="e.g., 10000000"
                        value={advancedFilters.annual_revenue_max || ''}
                        onChange={(e) => handleAdvancedFilterChange('annual_revenue_max', 
                          e.target.value ? parseInt(e.target.value) : undefined)}
                        className="pl-10"
                      />
                    </div>
                  </FormField>
                </div>

                {/* Contact Information Requirements */}
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Required Contact Information</h5>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={advancedFilters.has_email ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAdvancedFilterChange('has_email', !advancedFilters.has_email)}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Email Required
                    </Button>
                    <Button
                      type="button"
                      variant={advancedFilters.has_phone ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAdvancedFilterChange('has_phone', !advancedFilters.has_phone)}
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Phone Required
                    </Button>
                    <Button
                      type="button"
                      variant={advancedFilters.has_website ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAdvancedFilterChange('has_website', !advancedFilters.has_website)}
                    >
                      <Globe2 className="h-3 w-3 mr-1" />
                      Website Required
                    </Button>
                  </div>
                </div>

                {/* Lead Score Range */}
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Min Lead Score">
                    <div className="relative">
                      <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="e.g., 70"
                        value={advancedFilters.lead_score_min || ''}
                        onChange={(e) => handleAdvancedFilterChange('lead_score_min', 
                          e.target.value ? parseInt(e.target.value) : undefined)}
                        className="pl-10"
                      />
                    </div>
                  </FormField>

                  <FormField label="Max Lead Score">
                    <div className="relative">
                      <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="e.g., 100"
                        value={advancedFilters.lead_score_max || ''}
                        onChange={(e) => handleAdvancedFilterChange('lead_score_max', 
                          e.target.value ? parseInt(e.target.value) : undefined)}
                        className="pl-10"
                      />
                    </div>
                  </FormField>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Search Options */}
          <Card className="bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="save_search"
                  checked={formData.save_search}
                  onChange={(e) => handleFieldChange('save_search', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="save_search" className="font-medium flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Save this search
                </label>
              </div>

              {formData.save_search && (
                <div className="space-y-4">
                  <FormField
                    label="Search Name"
                    required
                    error={errors.search_name}
                  >
                    <Input
                      placeholder="e.g., Tech Startups in SF"
                      value={formData.search_name}
                      onChange={(e) => handleFieldChange('search_name', e.target.value)}
                    />
                  </FormField>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="alert_enabled"
                      checked={formData.alert_enabled}
                      onChange={(e) => handleFieldChange('alert_enabled', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="alert_enabled" className="font-medium flex items-center">
                      <Bell className="h-4 w-4 mr-2" />
                      Enable alerts for new leads
                    </label>
                  </div>

                  {formData.alert_enabled && (
                    <FormField label="Alert Frequency">
                      <Select
                        options={[
                          { value: 'daily', label: 'Daily' },
                          { value: 'weekly', label: 'Weekly' },
                          { value: 'monthly', label: 'Monthly' }
                        ]}
                        value={formData.alert_frequency || 'weekly'}
                        onChange={(e) => handleFieldChange('alert_frequency', e.target.value)}
                      />
                    </FormField>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Warning */}
          {!canMakeRequest && (
            <div className="flex items-center space-x-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive font-medium">
                You have reached your usage limit. Please upgrade your plan to continue.
              </p>
            </div>
          )}

          {/* Search Progress */}
          {isSubmitting && (
            <div className="space-y-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-center justify-center space-x-3">
                <div className="relative">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                    Processing advanced search...
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {Math.round(searchProgress)}% complete
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${searchProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <Button 
              type="submit"
              size="lg"
              disabled={!canMakeRequest || isSubmitting}
              className="group relative px-10 py-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <Search className="h-5 w-5 mr-3" />
                  <span>Start Advanced Search</span>
                  <ArrowRight className="h-5 w-5 ml-3" />
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}