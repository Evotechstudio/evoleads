'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useClerkAuth } from '../../lib/auth/clerk-context'
import { useToast } from '../ui/toast'
import { Check, Zap, Star, Crown } from 'lucide-react'
import { motion } from 'framer-motion'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceInPKR: 0,
    interval: 'free',
    clerkPlanId: null,
    features: [
      '2 search requests',
      '20 leads total',
      'Basic lead information',
      'CSV export',
      'Email support'
    ],
    limitations: [
      'Limited to 2 searches',
      'No advanced filtering',
      'No API access'
    ],
    popular: false,
    cta: 'Current Plan',
    icon: Zap,
    color: 'from-gray-400 to-gray-600'
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 15,
    priceInPKR: 4200, // $15 ≈ 4200 PKR
    interval: 'month',
    clerkPlanId: 'cplan_34n96CAT3Px6QokfOSAiFLybroyW',
    features: [
      '50 search requests per month',
      '250 leads per month',
      'Advanced lead information',
      'CSV/Excel export',
      'Email & phone support',
      'Lead favoriting & notes',
      'Search history',
      'Priority support'
    ],
    limitations: [],
    popular: true,
    cta: 'Upgrade to Starter',
    icon: Star,
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    priceInPKR: 13720, // $49 ≈ 13720 PKR
    interval: 'month',
    clerkPlanId: null, // Coming soon
    features: [
      'Unlimited search requests',
      '1,000 leads per month',
      'Premium lead information',
      'All export formats',
      'Priority support',
      'Advanced analytics',
      'API access',
      'Team collaboration',
      'Custom integrations'
    ],
    limitations: [],
    popular: false,
    cta: 'Coming Soon',
    icon: Crown,
    color: 'from-purple-500 to-pink-600'
  }
]

export function PricingTable() {
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
        throw new Error('Invalid plan selected')
      }
      
      addToast({
        type: 'info',
        title: 'Upgrade Process',
        message: 'Redirecting to Safepay payment processor...'
      })
      
      // Create checkout session with Clerk plan ID
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.clerkPlanId,
          planName: plan.name,
          price: plan.price
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }
      
      // Redirect to Safepay checkout
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
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
            className={`relative ${plan.popular ? 'scale-105' : ''}`}
          >
            <Card className={`relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg ${
              plan.popular ? 'border-primary shadow-lg' : 'border-border hover:border-primary/50'
            } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0">
                  <div className={`bg-gradient-to-r ${plan.color} text-white text-center py-2 text-sm font-medium`}>
                    Most Popular
                  </div>
                </div>
              )}
              
              <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-6'}`}>
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${plan.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? 'Free' : `₨${plan.priceInPKR.toLocaleString()}`}
                  </span>
                  {plan.interval !== 'free' && plan.price > 0 && (
                    <span className="text-muted-foreground">/{plan.interval}</span>
                  )}
                </div>
                
                {plan.price > 0 && (
                  <div className="text-sm text-muted-foreground">
                    (${plan.price} USD)
                  </div>
                )}
                
                {isCurrent && (
                  <Badge variant="secondary" className="mt-2">
                    Current Plan
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Features
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {plan.limitations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      Limitations
                    </h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <div className="h-4 w-4 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <div className="h-1.5 w-1.5 bg-orange-500 rounded-full" />
                          </div>
                          <span className="text-sm text-muted-foreground">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="pt-4">
                  {isCurrent ? (
                    <Button disabled className="w-full" variant="outline">
                      Current Plan
                    </Button>
                  ) : canUpgradeToThis ? (
                    <Button 
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isLoadingThis || !user}
                      className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white border-0`}
                    >
                      {isLoadingThis ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </div>
                      ) : (
                        plan.cta
                      )}
                    </Button>
                  ) : plan.id === 'pro' ? (
                    <Button disabled className="w-full" variant="outline">
                      Coming Soon
                    </Button>
                  ) : (
                    <Button disabled className="w-full" variant="outline">
                      Downgrade Not Available
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}