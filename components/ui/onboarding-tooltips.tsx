'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { cn } from '../../lib/utils'

interface OnboardingStep {
  id: string
  title: string
  description: string
  target: string // CSS selector
  position?: 'top' | 'bottom' | 'left' | 'right'
  offset?: { x: number; y: number }
  action?: {
    label: string
    onClick: () => void
  }
}

interface OnboardingTooltipsProps {
  steps: OnboardingStep[]
  isActive: boolean
  onComplete: () => void
  onSkip: () => void
  className?: string
}

export function OnboardingTooltips({
  steps,
  isActive,
  onComplete,
  onSkip,
  className
}: OnboardingTooltipsProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  const updateTooltipPosition = useCallback(() => {
    if (!isActive || currentStep >= steps.length) return

    const step = steps[currentStep]
    if (!step) return
    
    const targetElement = document.querySelector(step.target)
    
    if (!targetElement) {
      console.warn(`Onboarding target not found: ${step.target}`)
      return
    }

    const rect = targetElement.getBoundingClientRect()
    const offset = step.offset || { x: 0, y: 0 }
    
    let x = rect.left + rect.width / 2 + offset.x
    let y = rect.top + offset.y

    switch (step.position) {
      case 'top':
        y = rect.top - 10 + offset.y
        break
      case 'bottom':
        y = rect.bottom + 10 + offset.y
        break
      case 'left':
        x = rect.left - 10 + offset.x
        y = rect.top + rect.height / 2 + offset.y
        break
      case 'right':
        x = rect.right + 10 + offset.x
        y = rect.top + rect.height / 2 + offset.y
        break
      default:
        y = rect.bottom + 10 + offset.y
    }

    setTooltipPosition({ x, y })
    setIsVisible(true)
  }, [isActive, currentStep, steps])

  useEffect(() => {
    if (isActive) {
      updateTooltipPosition()
      window.addEventListener('resize', updateTooltipPosition)
      window.addEventListener('scroll', updateTooltipPosition)
      
      return () => {
        window.removeEventListener('resize', updateTooltipPosition)
        window.removeEventListener('scroll', updateTooltipPosition)
      }
    } else {
      setIsVisible(false)
      return undefined
    }
  }, [isActive, updateTooltipPosition])

  const handleNext = () => {
    const step = steps[currentStep]
    if (!step) return
    
    // Execute step action if provided
    if (step.action) {
      step.action.onClick()
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setIsVisible(false)
    onComplete()
  }

  const handleSkip = () => {
    setIsVisible(false)
    onSkip()
  }

  if (!isActive || !isVisible || currentStep >= steps.length) {
    return null
  }

  const step = steps[currentStep]
  if (!step) return null
  
  const isLastStep = currentStep === steps.length - 1

  return (
    <>
      {/* Overlay with better backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in-0 duration-300" />
      
      {/* Spotlight effect on target element */}
      <style jsx>{`
        ${step.target} {
          position: relative;
          z-index: 41;
          box-shadow: 
            0 0 0 4px hsl(var(--primary) / 0.5),
            0 0 0 8px hsl(var(--primary) / 0.2),
            0 0 0 9999px rgba(0, 0, 0, 0.5);
          border-radius: 12px;
          transition: all 0.3s ease-in-out;
        }
      `}</style>

      {/* Enhanced Tooltip */}
      <div
        className={cn(
          'fixed z-50 transform -translate-x-1/2 -translate-y-full animate-in slide-in-from-bottom-2 duration-300',
          className
        )}
        style={{
          left: tooltipPosition.x,
          top: tooltipPosition.y,
        }}
      >
        <Card className="w-80 shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <CardTitle className="text-lg font-semibold">{step.title}</CardTitle>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {step.description}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted/50 -mt-1 -mr-1"
                onClick={handleSkip}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {currentStep + 1} of {steps.length}
                </span>
                <div className="flex space-x-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        index <= currentStep 
                          ? 'w-6 bg-primary' 
                          : 'w-2 bg-muted'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    className="h-8"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="h-8 text-muted-foreground hover:text-foreground"
                >
                  Skip tour
                </Button>
              </div>
              
              <Button
                size="sm"
                onClick={handleNext}
                className="h-8 min-w-[80px]"
              >
                {isLastStep ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// Hook for managing onboarding state
export function useOnboarding(key: string) {
  const [isActive, setIsActive] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)

  useEffect(() => {
    const completed = localStorage.getItem(`onboarding-${key}`)
    if (completed === 'true') {
      setHasCompleted(true)
    }
  }, [key])

  const startOnboarding = useCallback(() => {
    if (!hasCompleted) {
      setIsActive(true)
    }
  }, [hasCompleted])

  const completeOnboarding = useCallback(() => {
    setIsActive(false)
    setHasCompleted(true)
    localStorage.setItem(`onboarding-${key}`, 'true')
  }, [key])

  const skipOnboarding = useCallback(() => {
    setIsActive(false)
    setHasCompleted(true)
    localStorage.setItem(`onboarding-${key}`, 'true')
  }, [key])

  const resetOnboarding = useCallback(() => {
    setIsActive(false)
    setHasCompleted(false)
    localStorage.removeItem(`onboarding-${key}`)
  }, [key])

  return {
    isActive,
    hasCompleted,
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  }
}

// Predefined onboarding flows
export const dashboardOnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Evo Lead AI!',
    description: 'Let\'s take a quick tour to help you get started with generating high-quality leads.',
    target: '[data-onboarding="dashboard"]',
    position: 'bottom',
  },
  {
    id: 'search-form',
    title: 'Start Your Search',
    description: 'Use this form to specify what type of businesses you\'re looking for and where to find them.',
    target: '[data-onboarding="search-form"]',
    position: 'right',
  },
  {
    id: 'credits',
    title: 'Monitor Your Usage',
    description: 'Keep track of your remaining credits and upgrade your plan when needed.',
    target: '[data-onboarding="credits"]',
    position: 'bottom',
  },
  {
    id: 'results',
    title: 'View Your Leads',
    description: 'Once your search completes, you\'ll see your leads here with confidence scores and export options.',
    target: '[data-onboarding="results"]',
    position: 'top',
  },
]

export const searchOnboardingSteps: OnboardingStep[] = [
  {
    id: 'business-type',
    title: 'Specify Business Type',
    description: 'Enter the type of business you want to find (e.g., "restaurants", "law firms", "tech startups").',
    target: '[data-onboarding="business-type"]',
    position: 'bottom',
  },
  {
    id: 'location',
    title: 'Choose Location',
    description: 'Select the geographic area where you want to find leads. Be as specific as possible for better results.',
    target: '[data-onboarding="location"]',
    position: 'bottom',
  },
  {
    id: 'volume',
    title: 'Select Volume',
    description: 'Choose how many leads you want to generate. Remember, each search uses credits from your plan.',
    target: '[data-onboarding="volume"]',
    position: 'bottom',
  },
]