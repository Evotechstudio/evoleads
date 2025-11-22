'use client'

import React from 'react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { 
  useErrorHandler, 
  ErrorMessage,
  HelpTooltip,
  InfoTooltip,
  useDeleteConfirmation,
  OnboardingTooltips,
  useOnboarding,
  dashboardOnboardingSteps,
} from './index'

// Enhanced example component showing the improved error handling system
export function ErrorHandlingExamples() {
  const handleError = useErrorHandler()
  const { confirmDelete, ConfirmationModal } = useDeleteConfirmation()
  const { isActive, startOnboarding, completeOnboarding, skipOnboarding } = useOnboarding('examples')

  // Example API call
  const [isRetrying, setIsRetrying] = React.useState(false)
  
  const executeApiCall = async () => {
    const response = await fetch('/api/example')
    if (!response.ok) {
      throw new Error('API call failed')
    }
    return response.json()
  }

  const handleApiCallWithError = async () => {
    try {
      setIsRetrying(true)
      await executeApiCall()
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Unknown error'))
    } finally {
      setIsRetrying(false)
    }
  }

  const handleNetworkErrorExample = () => {
    handleError(new Error('Failed to connect to server'))
  }

  const handleValidationErrorExample = () => {
    handleError(new Error('Please enter a valid email address'))
  }

  const handleDeleteExample = () => {
    confirmDelete('Lead Record', async () => {
      // Simulate delete operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Item deleted')
    }, [
      'Remove all associated data',
      'Cannot be recovered',
      'May affect related records'
    ])
  }

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
          Enhanced Error Handling System
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
          Comprehensive user feedback with modern UI patterns and beautiful blue gradients
        </p>
      </div>
      
      <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-xl bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-background">
        <CardHeader className="bg-gradient-to-r from-blue-500/10 via-blue-400/5 to-blue-600/10 border-b border-blue-200/50 dark:border-blue-800/50">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">✨</span>
            </div>
            <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 bg-clip-text text-transparent font-bold">
              Interactive Examples
            </span>
            <HelpTooltip content="This demonstrates the comprehensive error handling system with shadcn/ui styling">
              <InfoTooltip content="Click the buttons below to see different error handling scenarios in action with enhanced animations and feedback" />
            </HelpTooltip>
          </CardTitle>
          <CardDescription className="text-base text-blue-700 dark:text-blue-300 font-medium">
            Experience the enhanced error handling and user feedback system with modern animations and improved UX
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              onClick={handleApiCallWithError}
              disabled={isRetrying}
              className="h-14 text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
            >
              {isRetrying ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Retrying...
                  </span>
                </>
              ) : (
                <>
                  <span className="mr-2 text-lg">🔄</span>
                  API Error with Retry
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleNetworkErrorExample}
              className="h-14 text-sm font-semibold bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
            >
              <span className="mr-2 text-lg">📡</span>
              Network Error
            </Button>
            
            <Button 
              onClick={handleValidationErrorExample}
              className="h-14 text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
            >
              <span className="mr-2 text-lg">⚠️</span>
              Validation Error
            </Button>
            
            <Button 
              onClick={handleDeleteExample}
              className="h-14 text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
            >
              <span className="mr-2 text-lg">🗑️</span>
              Delete Confirmation
            </Button>
            
            <Button 
              onClick={startOnboarding}
              className="h-14 text-sm font-semibold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
            >
              <span className="mr-2 text-lg">🎯</span>
              Start Onboarding
            </Button>
            
            <Button 
              onClick={() => window.location.reload()}
              className="h-14 text-sm font-semibold bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
            >
              <span className="mr-2 text-lg">🔄</span>
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl border-2 border-blue-100 dark:border-blue-900 bg-gradient-to-br from-blue-50/30 to-white dark:from-blue-950/10 dark:to-background">
        <CardHeader className="border-b border-blue-100 dark:border-blue-900 bg-gradient-to-r from-blue-500/5 to-blue-600/5">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 bg-clip-text text-transparent font-bold">
              Error Message Showcase
            </span>
          </CardTitle>
          <CardDescription className="text-base text-blue-700 dark:text-blue-300 font-medium">
            Different types of error messages with enhanced styling, animations, and contextual actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ErrorMessage
            type="network"
            title="Connection Issue"
            message="Unable to reach the server. Please check your internet connection and try again."
            onRetry={() => console.log('Retrying network connection...')}
          />
          
          <ErrorMessage
            type="validation"
            title="Invalid Input Detected"
            message="Please review the form fields below and correct any validation errors before proceeding."
          />
          
          <ErrorMessage
            type="payment"
            title="Payment Processing Failed"
            message="Your payment could not be processed at this time. Please verify your payment method or try a different card."
            details="Error Code: CARD_DECLINED | Transaction ID: txn_1234567890 | Timestamp: 2024-01-15T10:30:00Z"
            onRetry={() => console.log('Retrying payment processing...')}
          />
          
          <ErrorMessage
            type="search"
            title="Lead Search Timeout"
            message="Your search request took longer than expected. This might be due to high server load or complex search parameters."
            details="Search Parameters: business_type='restaurants', location='New York', volume=100"
            onRetry={() => console.log('Retrying lead search...')}
          />
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmationModal />

      {/* Onboarding Tooltips */}
      <OnboardingTooltips
        steps={dashboardOnboardingSteps}
        isActive={isActive}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
      />
    </div>
  )
}

// Usage examples for developers
export const errorHandlingUsageExamples = `
// 1. Basic error handling with toast
const { handleError } = useErrorHandler()

try {
  await someAsyncOperation()
} catch (error) {
  handleError(error, { context: 'search', retryAction: () => someAsyncOperation() })
}

// 2. API calls with error handling
const searchLeads = async (params: any) => {
  const response = await fetch('/api/leads/search', {
    method: 'POST',
    body: JSON.stringify(params)
  })
  if (!response.ok) throw new Error('Search failed')
  return response.json()
}

// 3. Delete confirmation with consequences
const { confirmDelete, ConfirmationModal } = useDeleteConfirmation()

const handleDelete = () => {
  confirmDelete('Organization', async () => {
    await deleteOrganization(orgId)
  }, [
    'Delete all organization data',
    'Remove all team members',
    'Cancel active subscriptions'
  ])
}

// 4. Onboarding tooltips
const { isActive, startOnboarding, completeOnboarding } = useOnboarding('dashboard')

useEffect(() => {
  if (isFirstVisit) {
    startOnboarding()
  }
}, [isFirstVisit, startOnboarding])

// 5. Help tooltips
<HelpTooltip content="This field accepts business types like 'restaurants', 'law firms', etc.">
  <Input placeholder="Enter business type..." />
</HelpTooltip>

// 6. Error boundaries for sections
<SearchErrorBoundary>
  <LeadSearchForm />
</SearchErrorBoundary>
`