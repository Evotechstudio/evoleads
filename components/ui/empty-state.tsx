'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Button } from './button'
import { cn } from '../../lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'secondary'
  }
  className?: string
  children?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center p-8 min-h-[300px]',
      className
    )}>
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      )}
      
      {action && (
        <Button 
          onClick={action.onClick}
          variant={action.variant || 'default'}
        >
          {action.label}
        </Button>
      )}
      
      {children}
    </div>
  )
}

// Specific empty state variants
interface NoResultsProps {
  searchTerm?: string
  onClearSearch?: () => void
  onNewSearch?: () => void
}

export function NoResults({ searchTerm, onClearSearch, onNewSearch }: NoResultsProps) {
  return (
    <EmptyState
      title="No results found"
      description={
        searchTerm 
          ? `We couldn't find any results for "${searchTerm}". Try adjusting your search criteria.`
          : "No results match your current filters. Try adjusting your search criteria."
      }
      action={
        onNewSearch 
          ? { label: 'New Search', onClick: onNewSearch }
          : onClearSearch 
          ? { label: 'Clear Search', onClick: onClearSearch, variant: 'outline' }
          : undefined
      }
    />
  )
}

interface NoDataProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function NoData({ 
  title = "No data available",
  description = "There's no data to display yet. Get started by adding some content.",
  actionLabel = "Get Started",
  onAction
}: NoDataProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={onAction ? { label: actionLabel, onClick: onAction } : undefined}
    />
  )
}

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({ 
  title = "Something went wrong",
  description = "We encountered an error while loading your data. Please try again.",
  onRetry
}: ErrorStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={onRetry ? { label: 'Try Again', onClick: onRetry, variant: 'outline' } : undefined}
    />
  )
}