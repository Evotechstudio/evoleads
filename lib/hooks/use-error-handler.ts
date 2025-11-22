'use client'

import { useCallback } from 'react'
import { useErrorToast, useRetryToast, useNetworkErrorToast, usePermissionErrorToast } from '../../components/ui/toast'
import { useErrorMessage, ErrorType } from '../../components/ui/error-messages'

interface ErrorHandlerOptions {
  context?: ErrorType
  showToast?: boolean
  logError?: boolean
  reportError?: boolean
  retryAction?: () => void
}

export function useErrorHandler() {
  const errorToast = useErrorToast()
  const retryToast = useRetryToast()
  const networkErrorToast = useNetworkErrorToast()
  const permissionErrorToast = usePermissionErrorToast()
  const getErrorMessage = useErrorMessage()

  const handleError = useCallback((
    error: Error | string,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      context,
      showToast = true,
      logError = true,
      reportError = true,
      retryAction
    } = options

    const errorMessage = typeof error === 'string' ? error : error.message
    const errorObj = typeof error === 'string' ? new Error(error) : error

    // Log error to console
    if (logError) {
      console.error('Error handled:', errorObj)
    }

    // Report error to monitoring service
    if (reportError && process.env.NODE_ENV === 'production') {
      // In a real app, integrate with Sentry or similar
      // Sentry.captureException(errorObj)
    }

    // Show appropriate toast notification
    if (showToast) {
      const { type } = getErrorMessage(errorObj, context)
      
      switch (type) {
        case 'network':
          if (retryAction) {
            networkErrorToast(retryAction)
          } else {
            errorToast('Connection Error', errorMessage)
          }
          break
          
        case 'authorization':
          permissionErrorToast()
          break
          
        default:
          if (retryAction) {
            retryToast('Operation Failed', errorMessage, retryAction)
          } else {
            errorToast('Error', errorMessage)
          }
      }
    }

    return { type: context || 'unknown', message: errorMessage }
  }, [errorToast, retryToast, networkErrorToast, permissionErrorToast, getErrorMessage])

  // Specialized error handlers
  const handleApiError = useCallback((error: Error | string, retryAction?: () => void) => {
    return handleError(error, {
      context: 'server',
      retryAction,
      reportError: true,
    })
  }, [handleError])

  const handleNetworkError = useCallback((error: Error | string, retryAction?: () => void) => {
    return handleError(error, {
      context: 'network',
      retryAction,
      reportError: false, // Network errors are usually temporary
    })
  }, [handleError])

  const handleValidationError = useCallback((error: Error | string) => {
    return handleError(error, {
      context: 'validation',
      reportError: false, // Validation errors are user errors, not system errors
    })
  }, [handleError])

  const handlePaymentError = useCallback((error: Error | string, retryAction?: () => void) => {
    return handleError(error, {
      context: 'payment',
      retryAction,
      reportError: true,
    })
  }, [handleError])

  const handleAuthError = useCallback((error: Error | string) => {
    return handleError(error, {
      context: 'authentication',
      reportError: true,
    })
  }, [handleError])

  const handleSearchError = useCallback((error: Error | string, retryAction?: () => void) => {
    return handleError(error, {
      context: 'search',
      retryAction,
      reportError: true,
    })
  }, [handleError])

  return {
    handleError,
    handleApiError,
    handleNetworkError,
    handleValidationError,
    handlePaymentError,
    handleAuthError,
    handleSearchError,
  }
}

// Global error handler for unhandled promise rejections
export function setupGlobalErrorHandling() {
  if (typeof window === 'undefined') return

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    
    // Prevent the default browser behavior
    event.preventDefault()
    
    // In a real app, report to error tracking service
    // Sentry.captureException(event.reason)
  })

  // Handle global errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    
    // In a real app, report to error tracking service
    // Sentry.captureException(event.error)
  })
}

// Hook for handling async operations with error handling
export function useAsyncError() {
  const { handleError } = useErrorHandler()

  const executeAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options?: ErrorHandlerOptions
  ): Promise<T | null> => {
    try {
      return await asyncFn()
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)), options)
      return null
    }
  }, [handleError])

  return { executeAsync }
}