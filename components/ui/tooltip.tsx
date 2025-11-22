'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '../../lib/utils'

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-lg border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

// Enhanced tooltip components for common use cases
interface HelpTooltipProps {
  children: React.ReactNode
  content: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

export function HelpTooltip({ children, content, side = 'top', className }: HelpTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} className={className}>
        <p className="max-w-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  )
}

interface InfoTooltipProps {
  content: string
  title?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

export function InfoTooltip({ content, title, side = 'top', className }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors text-xs font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          ?
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className={cn('max-w-sm', className)}>
        {title && <p className="font-semibold mb-1 text-foreground">{title}</p>}
        <p className="text-sm leading-relaxed">{content}</p>
      </TooltipContent>
    </Tooltip>
  )
}

interface FeatureTooltipProps {
  children: React.ReactNode
  title: string
  description: string
  shortcut?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function FeatureTooltip({ 
  children, 
  title, 
  description, 
  shortcut, 
  side = 'top' 
}: FeatureTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-sm">
        <div className="space-y-2">
          <p className="font-semibold text-foreground">{title}</p>
          <p className="text-sm leading-relaxed">{description}</p>
          {shortcut && (
            <div className="flex items-center gap-1 pt-1">
              <span className="text-xs text-muted-foreground">Shortcut:</span>
              <kbd className="px-2 py-1 bg-muted rounded-md text-xs font-mono border">{shortcut}</kbd>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}