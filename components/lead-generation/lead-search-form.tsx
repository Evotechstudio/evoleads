'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { FormField, FormGroup, Select } from '../ui/form'
import { LoadingSpinner } from '../ui/loading-spinner'
import { useToast } from '../ui/toast'
import { useClerkAuth } from '../../lib/auth/clerk-context'
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
  CheckCircle,
  XCircle
} from 'lucide-react'
import { SearchFormData, FormErrors } from '../../types/lead-generation'

// Business types for lead generation
const BUSINESS_TYPES = [
  'Restaurants & Food Service',
  'Retail Stores',
  'Real Estate Agencies',
  'Law Firms',
  'Medical Practices',
  'Dental Offices',
  'Auto Repair Shops',
  'Hair Salons & Spas',
  'Fitness Centers & Gyms',
  'Accounting Firms',
  'Marketing Agencies',
  'Construction Companies',
  'Insurance Agencies',
  'Financial Services',
  'Consulting Services',
  'Technology Companies',
  'E-commerce Businesses',
  'Manufacturing',
  'Wholesale Trade',
  'Transportation Services'
]

// Location data interfaces
interface City {
  id: number
  name: string
  latitude: string
  longitude: string
}

interface State {
  id: number
  name: string
  state_code: string
  latitude: string
  longitude: string
  cities: City[]
}

interface Country {
  id: number
  name: string
  iso2: string
  iso3: string
  phone_code: string
  capital: string
  currency: string
  states: State[]
}

// Lead volume options
const LEAD_VOLUMES = [
  { value: 10, label: '10 leads' },
  { value: 20, label: '20 leads' },
  { value: 50, label: '50 leads' }
]

interface LeadSearchFormProps {
  onSearchSubmit?: (data: SearchFormData) => Promise<void>
  className?: string
}

export function LeadSearchForm({ onSearchSubmit, className }: LeadSearchFormProps) {
  const { addToast } = useToast()
  const { user } = useClerkAuth()
  
  // Plan info state
  const [planInfo, setPlanInfo] = useState<{
    leadsAvailable: number
    requestsRemaining: number
    canMakeRequest: boolean
  } | null>(null)
  
  // Location data state
  const [locationData, setLocationData] = useState<Country[]>([])
  const [loadingLocation, setLoadingLocation] = useState(true)
  
  // Form state
  const [formData, setFormData] = useState<SearchFormData>({
    businessType: '',
    country: '',
    state: '',
    city: '',
    leadsRequested: 10
  })
  
  // Form validation and UI state
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchProgress, setSearchProgress] = useState(0)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  // Load plan info on component mount
  useEffect(() => {
    const fetchPlanInfo = async () => {
      try {
        const response = await fetch('/api/user/plan-info')
        if (response.ok) {
          const data = await response.json()
          setPlanInfo({
            leadsAvailable: data.leadsAvailable,
            requestsRemaining: data.requestsRemaining,
            canMakeRequest: data.canMakeRequest
          })
        }
      } catch (error) {
        console.error('Error fetching plan info:', error)
      }
    }

    if (user) {
      fetchPlanInfo()
    }
  }, [user])

  // Load location data on component mount
  useEffect(() => {
    const loadLocationData = async () => {
      try {
        const response = await fetch('/countries+states+cities.json')
        const data = await response.json()
        setLocationData(data)
      } catch (error) {
        console.error('Failed to load location data:', error)
        addToast({
          type: 'error',
          title: 'Location Data Error',
          message: 'Failed to load countries and states data'
        })
      } finally {
        setLoadingLocation(false)
      }
    }

    loadLocationData()
  }, [addToast])

  // Get available countries, states, and cities based on selections
  const availableCountries = useMemo(() => {
    return locationData.map(country => ({
      value: country.iso2,
      label: country.name
    }))
  }, [locationData])

  const availableStates = useMemo(() => {
    if (!formData.country) return []
    const selectedCountry = locationData.find(country => country.iso2 === formData.country)
    return selectedCountry?.states.map(state => ({
      value: state.state_code,
      label: state.name
    })) || []
  }, [formData.country, locationData])

  const availableCities = useMemo(() => {
    if (!formData.country || !formData.state) return []
    const selectedCountry = locationData.find(country => country.iso2 === formData.country)
    const selectedState = selectedCountry?.states.find(state => state.state_code === formData.state)
    return selectedState?.cities.map(city => ({
      value: city.name,
      label: city.name
    })) || []
  }, [formData.country, formData.state, locationData])

  // Reset state when country changes
  const prevCountryRef = useRef(formData.country)
  useEffect(() => {
    if (formData.country !== prevCountryRef.current && prevCountryRef.current !== '') {
      setFormData(prev => ({ ...prev, state: '', city: '' }))
      setTouchedFields(prev => {
        const newSet = new Set(prev)
        newSet.delete('state')
        newSet.delete('city')
        return newSet
      })
    }
    prevCountryRef.current = formData.country
  }, [formData.country])

  // Reset city when state changes
  const prevStateRef = useRef(formData.state)
  useEffect(() => {
    if (formData.state !== prevStateRef.current && prevStateRef.current !== '') {
      setFormData(prev => ({ ...prev, city: '' }))
      setTouchedFields(prev => {
        const newSet = new Set(prev)
        newSet.delete('city')
        return newSet
      })
    }
    prevStateRef.current = formData.state
  }, [formData.state])

  // Real-time validation
  const validateField = (field: keyof SearchFormData, value: any): string | undefined => {
    switch (field) {
      case 'businessType':
        if (!value || value.trim() === '') {
          return 'Business type is required'
        }
        break
      case 'country':
        if (!value || value.trim() === '') {
          return 'Country is required'
        }
        break
      case 'state':
        if (availableStates.length > 0 && (!value || value.trim() === '')) {
          return 'State/Province is required'
        }
        break
      case 'city':
        if (!value || value.trim() === '') {
          return 'City is required'
        }
        if (value.length < 2) {
          return 'City name must be at least 2 characters'
        }
        break
      case 'leadsRequested':
        if (!value || value <= 0) {
          return 'Please select number of leads'
        }
        if (planInfo && planInfo.leadsAvailable < value) {
          return `Not enough leads remaining. You have ${planInfo.leadsAvailable} leads left.`
        }
        break
    }
    return undefined
  }

  // Validate usage limits
  const validateUsage = (): string | undefined => {
    if (planInfo && !planInfo.canMakeRequest) {
      return 'You have used all your search requests. Please upgrade to continue.'
    }
    
    if (planInfo && planInfo.leadsAvailable < formData.leadsRequested) {
      return `Not enough leads remaining. You have ${planInfo.leadsAvailable} leads left.`
    }
    
    return undefined
  }

  // Handle field changes with validation
  const handleFieldChange = (field: keyof SearchFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setTouchedFields(prev => new Set(prev).add(field))
    
    // Clear previous error and validate
    const fieldError = validateField(field, value)
    const usageError = field === 'leadsRequested' ? validateUsage() : undefined
    
    setErrors(prev => ({
      ...prev,
      [field]: fieldError,
      usage: usageError
    }))
  }

  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    let isValid = true

    // Validate all fields
    Object.keys(formData).forEach(key => {
      const field = key as keyof SearchFormData
      const error = validateField(field, formData[field])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    // Validate usage
    const usageError = validateUsage()
    if (usageError) {
      newErrors.usage = usageError
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mark all fields as touched
    setTouchedFields(new Set(Object.keys(formData)))
    
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
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 15
        })
      }, 200)

      // Call the search function
      if (onSearchSubmit) {
        await onSearchSubmit(formData)
      } else {
        // Default API call
        const response = await fetch('/api/leads/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate leads')
        }

        addToast({
          type: 'success',
          title: 'Leads Generated!',
          message: `Successfully generated ${data.leads?.length || formData.leadsRequested} leads for ${formData.businessType} in ${formData.city}, ${formData.state}`
        })
      }

      clearInterval(progressInterval)
      setSearchProgress(100)
      
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
    <div className={className}>
      <ModernCard variant="elevated" className="border-0 shadow-2xl" hover={false}>
        <ModernCardHeader className="text-center">
          <ModernCardTitle className="text-2xl flex items-center justify-center space-x-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <span className="text-foreground font-bold">
              Generate Leads
            </span>
          </ModernCardTitle>
          <ModernCardDescription className="text-base">
            Fill in the details below to find businesses in your target market
          </ModernCardDescription>
        </ModernCardHeader>
        
        <ModernCardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormGroup>
            {/* Business Type Field */}
            <FormField
              label="Business Type"
              required
              error={touchedFields.has('businessType') ? errors.businessType : undefined}
            >
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Select
                  options={BUSINESS_TYPES.map(type => ({ value: type, label: type }))}
                  placeholder="Select business type..."
                  value={formData.businessType}
                  onChange={(e) => handleFieldChange('businessType', e.target.value)}
                  error={touchedFields.has('businessType') && !!errors.businessType}
                  className="pl-10"
                />
              </div>
            </FormField>

            {/* Location Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Country Field */}
              <FormField
                label="Country"
                required
                error={touchedFields.has('country') ? errors.country : undefined}
              >
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Select
                    options={availableCountries}
                    placeholder={loadingLocation ? "Loading countries..." : "Select country..."}
                    value={formData.country}
                    onChange={(e) => handleFieldChange('country', e.target.value)}
                    error={touchedFields.has('country') && !!errors.country}
                    disabled={loadingLocation}
                    className="pl-10"
                  />
                </div>
              </FormField>

              {/* State/Province Field */}
              <FormField
                label="State/Province"
                required={availableStates.length > 0}
                error={touchedFields.has('state') ? errors.state : undefined}
              >
                <div className="relative">
                  <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Select
                    options={availableStates}
                    placeholder={!formData.country ? "Select country first..." : "Select state/province..."}
                    value={formData.state}
                    onChange={(e) => handleFieldChange('state', e.target.value)}
                    error={touchedFields.has('state') && !!errors.state}
                    disabled={availableStates.length === 0}
                    className="pl-10"
                  />
                </div>
              </FormField>
            </div>

            {/* City Field */}
            <FormField
              label="City"
              required
              error={touchedFields.has('city') ? errors.city : undefined}
            >
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                {availableCities.length > 0 ? (
                  <Select
                    options={availableCities}
                    placeholder="Select city..."
                    value={formData.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    error={touchedFields.has('city') && !!errors.city}
                    className="pl-10"
                  />
                ) : (
                  <Input
                    placeholder={!formData.state ? "Select state first..." : "Enter city name..."}
                    value={formData.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    disabled={!formData.state}
                    className="pl-10"
                  />
                )}
              </div>
            </FormField>

            {/* Lead Volume Field */}
            <FormField
              label="Number of Leads"
              required
              error={touchedFields.has('leadsRequested') ? errors.leadsRequested : undefined}
              description={`You have ${planInfo?.leadsAvailable || 0} leads remaining`}
            >
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Select
                  options={LEAD_VOLUMES.map(volume => ({ 
                    value: volume.value.toString(), 
                    label: volume.label,
                    disabled: volume.value > (planInfo?.leadsAvailable || 0)
                  }))}
                  placeholder="Select number of leads..."
                  value={formData.leadsRequested.toString()}
                  onChange={(e) => handleFieldChange('leadsRequested', parseInt(e.target.value))}
                  error={touchedFields.has('leadsRequested') && !!errors.leadsRequested}
                  className="pl-10"
                />
              </div>
            </FormField>
          </FormGroup>

          {/* Usage Warning */}
          {errors.usage && (
            <div className="flex items-center space-x-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive font-medium">{errors.usage}</p>
            </div>
          )}



          {/* Enhanced Search Progress */}
          <AnimatePresence>
            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50"
              >
                <div className="flex items-center justify-center space-x-3">
                  <LoadingSpinner size="md" variant="pulse" />
                  <div className="text-center">
                    <motion.div 
                      className="text-lg font-semibold text-blue-700 dark:text-blue-300"
                      animate={{ opacity: [1, 0.7, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Generating leads...
                    </motion.div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {Math.round(searchProgress)}% complete
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-3 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full relative overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: `${searchProgress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      {/* Animated shimmer effect on progress bar */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </motion.div>
                  </div>
                  <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                    <span>Searching...</span>
                    <span>{Math.round(searchProgress)}%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <Button 
              type="submit"
              size="lg"
              disabled={!planInfo?.canMakeRequest || isSubmitting}
              className="relative px-10 py-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-3" />
                  <span>Generating...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="p-1 rounded-full bg-white/20 mr-3">
                    <Search className="h-5 w-5" />
                  </div>
                  <span>Generate Leads</span>
                  <div className="p-1 rounded-full bg-white/20 ml-3">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              )}
            </Button>
          </div>
        </form>
      </ModernCardContent>
    </ModernCard>
    </div>
  )
}