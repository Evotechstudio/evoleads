'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { Button } from './button'
import { cn } from '../../lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  persistent?: boolean
  retryAction?: () => void
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration (unless persistent)
    const duration = toast.duration ?? 5000
    if (duration > 0 && !toast.persistent) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-0 right-0 z-50 m-4 flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
}

function ToastItem({ toast }: ToastItemProps) {
  const { removeToast } = useToast()

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-50'
      case 'error':
        return 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-50'
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-50'
    }
  }

  return (
    <div className={cn(
      'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
      getToastStyles()
    )}>
      <div className="grid gap-1">
        <div className="flex items-center gap-2">
          {getIcon()}
          <div className="text-sm font-semibold">{toast.title}</div>
        </div>
        {toast.message && (
          <div className="text-sm opacity-90">{toast.message}</div>
        )}
        
        {(toast.action || toast.secondaryAction || toast.retryAction) && (
          <div className="flex items-center gap-2 mt-2">
            {toast.retryAction && (
              <Button
                variant="outline"
                size="sm"
                onClick={toast.retryAction}
                className="h-8 px-3 text-xs"
              >
                Retry
              </Button>
            )}
            {toast.action && (
              <Button
                variant="outline"
                size="sm"
                onClick={toast.action.onClick}
                className="h-8 px-3 text-xs"
              >
                {toast.action.label}
              </Button>
            )}
            {toast.secondaryAction && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toast.secondaryAction.onClick}
                className="h-8 px-3 text-xs"
              >
                {toast.secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600"
        onClick={() => removeToast(toast.id)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>
    </div>
  )
}

// Convenience hooks for different toast types
export function useSuccessToast() {
  const { addToast } = useToast()
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message })
  }, [addToast])
}

export function useErrorToast() {
  const { addToast } = useToast()
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message })
  }, [addToast])
}

export function useWarningToast() {
  const { addToast } = useToast()
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message })
  }, [addToast])
}

export function useInfoToast() {
  const { addToast } = useToast()
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message })
  }, [addToast])
}

// Enhanced toast hooks for common scenarios
export function useRetryToast() {
  const { addToast } = useToast()
  return useCallback((title: string, message: string, retryAction: () => void) => {
    addToast({ 
      type: 'error', 
      title, 
      message, 
      retryAction,
      persistent: true
    })
  }, [addToast])
}

export function useActionToast() {
  const { addToast } = useToast()
  return useCallback((
    type: ToastType,
    title: string, 
    message: string, 
    action: { label: string; onClick: () => void },
    secondaryAction?: { label: string; onClick: () => void }
  ) => {
    addToast({ 
      type, 
      title, 
      message, 
      action,
      secondaryAction,
      duration: 8000
    })
  }, [addToast])
}

export function useNetworkErrorToast() {
  const { addToast } = useToast()
  return useCallback((retryAction: () => void) => {
    addToast({
      type: 'error',
      title: 'Connection Error',
      message: 'Unable to connect to our servers. Please check your internet connection.',
      retryAction,
      persistent: true
    })
  }, [addToast])
}

export function usePermissionErrorToast() {
  const { addToast } = useToast()
  return useCallback(() => {
    addToast({
      type: 'error',
      title: 'Permission Denied',
      message: 'You don\'t have permission to perform this action.',
      action: {
        label: 'Contact Support',
        onClick: () => window.open('mailto:support@evoleadai.com', '_blank')
      }
    })
  }, [addToast])
}