'use client'

import { useState, useCallback } from 'react'
import { useRetryToast, useNetworkErrorToast } from '../../components/ui/toast'

interface RetryOptions {
  maxAttempts?: number
  delay?: number
  backoff?: boolean
  onError?: (error: Error, attempt: number) => void
  onSuccess?: () => void
  onMaxAttemptsReached?: (error: Error) => void
}

interface UseRetryReturn<T> {
  execute: (...args: any[]) => Promise<T>
  isRetrying: boolean
  attemptCount: number
  lastError: Error | null
  reset: () => void
}

export function useRetry<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: RetryOptions = {}
): UseRetryReturn<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = true,
    onError,
    onSuccess,
    onMaxAttemptsReached
  } = options

  const [isRetrying, setIsRetrying] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [lastError, setLastError] = useState<Error | null>(null)

  const retryToast = useRetryToast()
  const networkErrorToast = useNetworkErrorToast()

  const reset = useCallback(() => {
    setIsRetrying(false)
    setAttemptCount(0)
    setLastError(null)
  }, [])

  const execute = useCallback(async (...args: any[]): Promise<T> => {
    let currentAttempt = 0
    
    while (currentAttempt < maxAttempts) {
      try {
        setIsRetrying(currentAttempt > 0)
        setAttemptCount(currentAttempt + 1)
        
        const result = await asyncFunction(...args)
        
        // Success
        setIsRetrying(false)
        setLastError(null)
        onSuccess?.()
        
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error')
        setLastError(err)
        currentAttempt++
        
        onError?.(err, currentAttempt)
        
        // If this was the last attempt
        if (currentAttempt >= maxAttempts) {
          setIsRetrying(false)
          onMaxAttemptsReached?.(err)
          
          // Show appropriate error toast
          if (isNetworkError(err)) {
            networkErrorToast(() => execute(...args))
          } else {
            retryToast(
              'Operation Failed',
              err.message || 'An unexpected error occurred',
              () => execute(...args)
            )
          }
          
          throw err
        }
        
        // Wait before retrying
        const waitTime = backoff ? delay * Math.pow(2, currentAttempt - 1) : delay
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
    
    throw lastError || new Error('Max attempts reached')
  }, [asyncFunction, maxAttempts, delay, backoff, onError, onSuccess, onMaxAttemptsReached, retryToast, networkErrorToast, lastError])

  return {
    execute,
    isRetrying,
    attemptCount,
    lastError,
    reset
  }
}

// Helper function to detect network errors
function isNetworkError(error: Error): boolean {
  const networkErrorMessages = [
    'fetch',
    'network',
    'connection',
    'timeout',
    'offline',
    'ERR_NETWORK',
    'ERR_INTERNET_DISCONNECTED'
  ]
  
  return networkErrorMessages.some(msg => 
    error.message.toLowerCase().includes(msg.toLowerCase())
  )
}

// Specialized retry hooks for common scenarios
export function useApiRetry<T>(
  apiCall: (...args: any[]) => Promise<T>,
  options: Omit<RetryOptions, 'maxAttempts'> & { maxAttempts?: number } = {}
) {
  return useRetry(apiCall, {
    maxAttempts: 3,
    delay: 1000,
    backoff: true,
    ...options
  })
}

export function usePaymentRetry<T>(
  paymentCall: (...args: any[]) => Promise<T>,
  options: Omit<RetryOptions, 'maxAttempts' | 'delay'> = {}
) {
  return useRetry(paymentCall, {
    maxAttempts: 2,
    delay: 2000,
    backoff: false,
    ...options
  })
}

export function useSearchRetry<T>(
  searchCall: (...args: any[]) => Promise<T>,
  options: Omit<RetryOptions, 'maxAttempts'> = {}
) {
  return useRetry(searchCall, {
    maxAttempts: 5,
    delay: 2000,
    backoff: true,
    ...options
  })
}