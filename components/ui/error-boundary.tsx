'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number | boolean | null | undefined>
  isolate?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  eventId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    eventId: null,
  }

  private resetTimeoutId: number | null = null

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      eventId: Math.random().toString(36).substr(2, 9),
    }
  }

  public componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props
    const { hasError } = this.state
    
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetOnPropsChange) {
        this.resetErrorBoundary()
      }
    }
  }

  public componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Report to error tracking service (e.g., Sentry)
    this.reportError(error, errorInfo)
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, you would integrate with Sentry or similar
    const errorReport = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      eventId: this.state.eventId,
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Report')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Full Report:', errorReport)
      console.groupEnd()
    }

    // In production, send to error tracking service
    // Example: Sentry.captureException(error, { contexts: { errorInfo } })
  }

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    })
  }

  private handleRetry = () => {
    this.resetErrorBoundary()
  }

  private handleReportIssue = () => {
    const { error, errorInfo, eventId } = this.state
    const subject = encodeURIComponent(`Error Report - ${eventId}`)
    const body = encodeURIComponent(`
Error ID: ${eventId}
Error: ${error?.message}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:


---
Technical Details:
${error?.stack}
${errorInfo?.componentStack}
    `.trim())
    
    window.open(`mailto:support@evoleadai.com?subject=${subject}&body=${body}`, '_blank')
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950 dark:via-background dark:to-blue-900">
          <Card className="w-full max-w-lg shadow-2xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-white to-blue-50/50 dark:from-background dark:to-blue-950/50">
            <CardHeader className="text-center pb-6 bg-gradient-to-r from-blue-500/5 to-blue-600/5 border-b border-blue-200 dark:border-blue-800">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 ring-8 ring-red-500/10 shadow-lg">
                <AlertTriangle className="h-10 w-10 text-red-500 animate-pulse drop-shadow-sm" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 bg-clip-text text-transparent">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-lg mt-3 leading-relaxed text-blue-700 dark:text-blue-300 font-medium">
                We encountered an unexpected error. This has been logged and our team will look into it.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="group rounded-lg border bg-muted/50 p-4">
                  <summary className="cursor-pointer font-medium text-sm flex items-center gap-2 hover:text-foreground transition-colors">
                    <svg className="h-4 w-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Error Details (Development)
                  </summary>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="p-3 bg-background rounded-md border">
                      <strong className="text-destructive">Error:</strong>
                      <p className="mt-1 font-mono text-xs">{this.state.error.message}</p>
                    </div>
                    <div className="p-3 bg-background rounded-md border">
                      <strong className="text-destructive">Stack Trace:</strong>
                      <pre className="mt-1 overflow-auto text-xs font-mono whitespace-pre-wrap max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div className="p-3 bg-background rounded-md border">
                        <strong className="text-destructive">Component Stack:</strong>
                        <pre className="mt-1 overflow-auto text-xs font-mono whitespace-pre-wrap max-h-32">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-6 bg-gradient-to-r from-blue-500/5 to-blue-600/5">
              <Button 
                onClick={this.handleRetry} 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
                size="lg"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Try Again
              </Button>
              <div className="flex gap-3 w-full">
                <Button 
                  onClick={this.handleReportIssue} 
                  className="flex-1 h-11 font-semibold bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white shadow-md hover:shadow-lg transition-all duration-300 border-0"
                >
                  Report Issue
                </Button>
                <Button 
                  onClick={this.handleGoHome} 
                  className="flex-1 h-11 font-semibold bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-md hover:shadow-lg transition-all duration-300 border-0"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by error handler:', error, errorInfo)
    
    // You can integrate with error reporting services here
    // Example: Sentry.captureException(error)
  }
}

// Specialized error boundaries for different contexts
interface AsyncErrorBoundaryProps extends Props {
  onRetry?: () => void
}

export function AsyncErrorBoundary({ onRetry, ...props }: AsyncErrorBoundaryProps) {
  return (
    <ErrorBoundary
      {...props}
      fallback={
        <ErrorFallback
          title="Loading Error"
          description="Failed to load this content. Please try again."
          resetError={onRetry}
        />
      }
    />
  )
}

export function PaymentErrorBoundary(props: Props) {
  return (
    <ErrorBoundary
      {...props}
      fallback={
        <ErrorFallback
          title="Payment Error"
          description="There was an issue processing your payment. Please try again or contact support."
        />
      }
    />
  )
}

export function SearchErrorBoundary(props: Props) {
  return (
    <ErrorBoundary
      {...props}
      fallback={
        <ErrorFallback
          title="Search Error"
          description="Unable to complete your search. Please check your parameters and try again."
        />
      }
    />
  )
}

// Simple error fallback component
interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  title?: string
  description?: string
}

export function ErrorFallback({ 
  error, 
  resetError, 
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.'
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
      
      {resetError && (
        <Button 
          onClick={resetError} 
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
      
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            Error Details
          </summary>
          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-w-md">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  )
}