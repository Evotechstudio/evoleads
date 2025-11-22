'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useClerkAuth } from '../../lib/auth/clerk-context'
import { useToast } from '../ui/toast'
import { Check, Zap, Star, Crown, Sparkles, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    priceInPKR: 0,
    interval: 'free',
    clerkPlanId: null,
    features: [
      '2 search requests',
      '20 leads total',
      'Basic lead information',
      'CSV export'
    ],
    popular: false,
    icon: Zap,
    color: 'from-gray-400 to-gray-600',
    bgColor: 'from-gray-50 to-gray-100',
    textColor: 'text-gray-700'
  },
  {
    id: 'starter',
    name: 'Starter',
    priceInPKR: 4200,
    interval: 'month',
    clerkPlanId: 'cplan_34n96CAT3Px6QokfOSAiFLybroyW',
    features: [
      '50 search requests per month',
      '250 leads per month',
      'Advanced lead information',
      'CSV/Excel export',
      'Priority support'
    ],
    popular: true,
    icon: Star,
    color: 'from-blue-500 to-purple-600',
    bgColor: 'from-blue-50 to-purple-50',
    textColor: 'text-blue-700'
  },
  {
    id: 'pro',
    name: 'Pro',
    priceInPKR: 13720,
    interval: 'month',
    clerkPlanId: null,
    features: [
      'Unlimited search requests',
      '1,000 leads per month',
      'Premium lead information',
      'All export formats',
      'API access',
      'Team collaboration'
    ],
    popular: false,
    icon: Crown,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'from-purple-50 to-pink-50',
    textColor: 'text-purple-700'
  }
]

export function DashboardPricing() {
  const { user, metadata } = useClerkAuth()
  const { addToast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (planId: string) => {
    try {
      setLoading(planId)
      
      const plan = PLANS.find(p => p.id === planId)
      if (!plan?.clerkPlanId) {
        if (plan?.id === 'pro') {
          addToast({
            type: 'info',
            title: 'Coming Soon',
            message: 'The Pro plan will be available soon. Stay tuned!'
          })
          return
        }
        return
      }
      
      addToast({
        type: 'info',
        title: 'Redirecting to Checkout',
        message: 'Taking you to secure payment via Safepay...'
      })
      
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.clerkPlanId,
          planName: plan.name,
          price: plan.priceInPKR / 280 // Convert PKR to USD for API
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
      
    } catch (error) {
      console.error('Upgrade error:', error)
      addToast({
        type: 'error',
        title: 'Upgrade Failed',
        message: error instanceof Error ? error.message : 'Failed to process upgrade. Please try again.'
      })
    } finally {
      setLoading(null)
    }
  }

  const getCurrentPlanId = () => {
    return metadata?.plan || 'free'
  }

  const isCurrentPlan = (planId: string) => {
    return getCurrentPlanId() === planId
  }

  const canUpgrade = (planId: string) => {
    const currentPlan = getCurrentPlanId()
    const planOrder = ['free', 'starter', 'pro']
    const currentIndex = planOrder.indexOf(currentPlan)
    const targetIndex = planOrder.indexOf(planId)
    return targetIndex > currentIndex
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          <span>Choose Your Plan</span>
        </div>
        <h2 className="text-2xl font-bold">Unlock More Leads</h2>
        <p className="text-muted-foreground">
          Upgrade to get unlimited searches and more leads per month
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan, index) => {
          const Icon = plan.icon
          const isCurrent = isCurrentPlan(plan.id)
          const canUpgradeToThis = canUpgrade(plan.id)
          const isLoadingThis = loading === plan.id
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative ${plan.popular ? 'md:scale-105 z-10' : ''}`}
            >
              <Card className={`relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg ${
                plan.popular 
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                  : isCurrent 
                    ? 'border-green-500 shadow-lg shadow-green-500/20' 
                    : 'border-border hover:border-primary/50'
              }`}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className={`bg-gradient-to-r ${plan.color} text-white text-center py-1.5 text-xs font-medium`}>
                      Most Popular
                    </div>
                  </div>
                )}
                
                {isCurrent && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-1.5 text-xs font-medium">
                      Current Plan
                    </div>
                  </div>
                )}
                
                <CardHeader className={`text-center ${plan.popular || isCurrent ? 'pt-8' : 'pt-4'} pb-4`}>
                  <div className="flex items-center justify-center mb-3">
                    <div className={`p-2 rounded-full bg-gradient-to-r ${plan.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                  
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-bold">
                      {plan.priceInPKR === 0 ? 'Free' : `₨${plan.priceInPKR.toLocaleString()}`}
                    </span>
                    {plan.interval !== 'free' && plan.priceInPKR > 0 && (
                      <span className="text-sm text-muted-foreground">/{plan.interval}</span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 pb-6">
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="pt-2">
                    {isCurrent ? (
                      <Button disabled className="w-full" variant="outline">
                        <Check className="h-4 w-4 mr-2" />
                        Current Plan
                      </Button>
                    ) : canUpgradeToThis ? (
                      <Button 
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isLoadingThis || !user}
                        className={`w-full relative overflow-hidden group ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:scale-105' 
                            : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white'
                        } transition-all duration-300 font-semibold`}
                      >
                        {isLoadingThis ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                          </div>
                        ) : (
                          <>
                            {plan.popular && (
                              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            )}
                            <Sparkles className="h-4 w-4 mr-2 relative z-10" />
                            <span className="relative z-10">Upgrade Now</span>
                            <ArrowRight className="h-4 w-4 ml-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                          </>
                        )}
                      </Button>
                    ) : plan.id === 'pro' ? (
                      <Button disabled className="w-full" variant="outline">
                        Coming Soon
                      </Button>
                    ) : (
                      <Button disabled className="w-full" variant="outline">
                        Not Available
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Additional Info */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Secure payments powered by Safepay • Cancel anytime • No setup fees
        </p>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/billing" className="text-primary hover:text-primary/80">
            View detailed billing information
            <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  )
}