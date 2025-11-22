'use client'

import React from 'react'
import { AlertTriangle, Wifi, CreditCard, Search, Users, Settings, Shield, RefreshCw, Mail } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'

export type ErrorType = 
  | 'network'
  | 'authentication' 
  | 'authorization'
  | 'payment'
  | 'search'
  | 'organization'
  | 'validation'
  | 'server'
  | 'unknown'

interface ErrorMessageProps {
  type: ErrorType
  title?: string
  message?: string
  details?: string
  onRetry?: () => void
  onContactSupport?: () => void
  className?: string
}

const errorConfig = {
  network: {
    icon: Wifi,
    defaultTitle: 'Connection Problem',
    defaultMessage: 'Unable to connect to our servers. Please check your internet connection and try again.',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/50',
    borderColor: 'border-orange-200 dark:border-orange-800',
    iconBg: 'bg-orange-100 dark:bg-orange-900/50',
  },
  authentication: {
    icon: Shield,
    defaultTitle: 'Authentication Required',
    defaultMessage: 'Please sign in to continue using Evo Lead AI.',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
  },
  authorization: {
    icon: Shield,
    defaultTitle: 'Access Denied',
    defaultMessage: 'You don\'t have permission to access this resource. Contact your organization admin if you believe this is an error.',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/50',
    borderColor: 'border-red-200 dark:border-red-800',
    iconBg: 'bg-red-100 dark:bg-red-900/50',
  },
  payment: {
    icon: CreditCard,
    defaultTitle: 'Payment Issue',
    defaultMessage: 'There was a problem processing your payment. Please check your payment method or try again.',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/50',
    borderColor: 'border-purple-200 dark:border-purple-800',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
  },
  search: {
    icon: Search,
    defaultTitle: 'Search Failed',
    defaultMessage: 'Unable to complete your lead search. Please check your search parameters and try again.',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/50',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/50',
  },
  organization: {
    icon: Users,
    defaultTitle: 'Organization Error',
    defaultMessage: 'There was an issue with your organization settings. Please contact your admin or try switching organizations.',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/50',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/50',
  },
  validation: {
    icon: AlertTriangle,
    defaultTitle: 'Invalid Input',
    defaultMessage: 'Please check your input and correct any errors before continuing.',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/50',
    borderColor: 'border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
  },
  server: {
    icon: Settings,
    defaultTitle: 'Server Error',
    defaultMessage: 'Our servers are experiencing issues. Please try again in a few moments.',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/50',
    borderColor: 'border-red-200 dark:border-red-800',
    iconBg: 'bg-red-100 dark:bg-red-900/50',
  },
  unknown: {
    icon: AlertTriangle,
    defaultTitle: 'Unexpected Error',
    defaultMessage: 'Something unexpected happened. Please try again or contact support if the problem persists.',
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-50 dark:bg-slate-950/50',
    borderColor: 'border-slate-200 dark:border-slate-800',
    iconBg: 'bg-slate-100 dark:bg-slate-900/50',
  },
}

export function ErrorMessage({
  type,
  title,
  message,
  details,
  onRetry,
  onContactSupport,
  className = '',
}: ErrorMessageProps) {
  const config = errorConfig[type]
  const Icon = config.icon

  const handleContactSupport = () => {
    if (onContactSupport) {
      onContactSupport()
    } else {
      window.open('mailto:support@evoleadai.com', '_blank')
    }
  }

  return (
    <Card className={cn('border-l-4', config.borderColor, className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-4">
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', config.iconBg)}>
            <Icon className={cn('h-5 w-5', config.color)} />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold leading-none tracking-tight">
              {title || config.defaultTitle}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {message || config.defaultMessage}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      {details && (
        <CardContent className="pt-0">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <span className="inline-flex items-center gap-1">
                Technical Details
                <svg className="h-4 w-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </summary>
            <div className={cn('mt-3 rounded-lg border p-4 font-mono text-xs', config.bgColor, config.borderColor)}>
              <pre className="whitespace-pre-wrap wrap-break-word">{details}</pre>
            </div>
          </details>
        </CardContent>
      )}
      
      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center gap-2">
          {onRetry && (
            <Button onClick={onRetry} size="sm" className="h-8">
              <RefreshCw className="mr-2 h-3 w-3" />
              Try Again
            </Button>
          )}
          <Button onClick={handleContactSupport} variant="outline" size="sm" className="h-8">
            <Mail className="mr-2 h-3 w-3" />
            Contact Support
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Specialized error message components
export function NetworkError({ onRetry, ...props }: Omit<ErrorMessageProps, 'type'>) {
  return <ErrorMessage type="network" onRetry={onRetry} {...props} />
}

export function AuthenticationError(props: Omit<ErrorMessageProps, 'type'>) {
  return <ErrorMessage type="authentication" {...props} />
}

export function PaymentError({ onRetry, ...props }: Omit<ErrorMessageProps, 'type'>) {
  return <ErrorMessage type="payment" onRetry={onRetry} {...props} />
}

export function SearchError({ onRetry, ...props }: Omit<ErrorMessageProps, 'type'>) {
  return <ErrorMessage type="search" onRetry={onRetry} {...props} />
}

export function ValidationError(props: Omit<ErrorMessageProps, 'type'>) {
  return <ErrorMessage type="validation" {...props} />
}

// Hook to get user-friendly error messages
export function useErrorMessage() {
  return (error: Error | string, context?: ErrorType): { type: ErrorType; title: string; message: string } => {
    const errorMessage = typeof error === 'string' ? error : error.message
    const errorStack = typeof error === 'string' ? '' : error.stack || ''
    
    // Auto-detect error type if not provided
    let detectedType: ErrorType = context || 'unknown'
    
    if (!context) {
      if (errorMessage.toLowerCase().includes('network') || 
          errorMessage.toLowerCase().includes('fetch') ||
          errorMessage.toLowerCase().includes('connection')) {
        detectedType = 'network'
      } else if (errorMessage.toLowerCase().includes('unauthorized') ||
                 errorMessage.toLowerCase().includes('authentication')) {
        detectedType = 'authentication'
      } else if (errorMessage.toLowerCase().includes('forbidden') ||
                 errorMessage.toLowerCase().includes('permission')) {
        detectedType = 'authorization'
      } else if (errorMessage.toLowerCase().includes('payment') ||
                 errorMessage.toLowerCase().includes('billing')) {
        detectedType = 'payment'
      } else if (errorMessage.toLowerCase().includes('search') ||
                 errorMessage.toLowerCase().includes('leads')) {
        detectedType = 'search'
      } else if (errorMessage.toLowerCase().includes('organization')) {
        detectedType = 'organization'
      } else if (errorMessage.toLowerCase().includes('validation') ||
                 errorMessage.toLowerCase().includes('invalid')) {
        detectedType = 'validation'
      } else if (errorMessage.toLowerCase().includes('server') ||
                 errorMessage.toLowerCase().includes('500')) {
        detectedType = 'server'
      }
    }
    
    const config = errorConfig[detectedType]
    
    return {
      type: detectedType,
      title: config.defaultTitle,
      message: errorMessage || config.defaultMessage,
    }
  }
}