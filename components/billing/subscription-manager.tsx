'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { useClerkAuth } from '../../lib/auth/clerk-context'
import { useToast } from '../ui/toast'
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Clock,
  Zap
} from 'lucide-react'
import { motion } from 'framer-motion'

interface PlanInfo {
  plan: string
  leadsUsed: number
  leadsAvailable: number
  leadsTotal: number
  requestsUsed: number
  requestsRemaining: number
  requestsTotal: number
  canMakeRequest: boolean
  canGenerateLeads: boolean
}

interface SubscriptionManagerProps {
  planInfo: PlanInfo | null
}

export function SubscriptionManager({ planInfo }: SubscriptionManagerProps) {
  const { user } = useClerkAuth()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)

  const currentPlan = useMemo(() => {
    if (!planInfo) return null
    
    const plans = {
      free: {
        name: 'Free',
        price: 0,
        priceInPKR: 0,
        features: ['2 search requests', '20 leads total', 'Basic support'],
        clerkPlanId: null,
        color: 'from-gray-400 to-gray-600'
      },
      starter: {
        name: 'Starter',
        price: 15,
        priceInPKR: 4200,
        features: ['50 search requests', '250 leads/month', 'Priority support', 'Advanced features'],
        clerkPlanId: 'cplan_34n96CAT3Px6QokfOSAiFLybroyW',
        color: 'from-blue-500 to-purple-600'
      }
    }
    
    return plans[planInfo.plan as keyof typeof plans] || plans.free
  }, [planInfo])

  const handleCancelSubscription = async () => {
    try {
      setLoading(true)
      
      // For free users, there's nothing to cancel
      if (planInfo?.plan === 'free') {
        addToast({
          type: 'info',
          title: 'No Active Subscription',
          message: 'You are currently on the free plan. No subscription to cancel.'
        })
        return
      }
      
      const response = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }
      
      addToast({
        type: 'success',
        title: 'Cancellation Scheduled',
        message: 'Your subscription will be canceled at the end of the current billing period.'
      })
      
      // Refresh user metadata
      window.location.reload()
      
    } catch (error) {
      console.error('Cancellation error:', error)
      addToast({
        type: 'error',
        title: 'Cancellation Failed',
        message: error instanceof Error ? error.message : 'Failed to cancel subscription. Please contact support.'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = () => {
    if (!planInfo) return null

    switch (planInfo.plan) {
      case 'free':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Free
          </Badge>
        )
      case 'starter':
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-blue-500">
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>
        )
      default:
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Unknown
          </Badge>
        )
    }
  }

  if (!planInfo) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-48 bg-muted rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!user || !currentPlan) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unable to Load Subscription</h3>
          <p className="text-muted-foreground">Please try refreshing the page or contact support.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${currentPlan.color} text-white`}>
                    <CreditCard className="h-5 w-5" />
                  </div>
                  Current Plan: {currentPlan.name}
                </CardTitle>
                <CardDescription>
                  {planInfo.plan === 'free' 
                    ? 'Free plan with limited features'
                    : 'Monthly subscription via Safepay'
                  }
                </CardDescription>
              </div>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Monthly Price</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {currentPlan.price === 0 ? 'Free' : `₨${currentPlan.priceInPKR.toLocaleString()}`}
                    </div>
                    {currentPlan.price > 0 && (
                      <div className="text-sm text-muted-foreground">
                        (${currentPlan.price} USD)
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Plan Features</h4>
                  <ul className="space-y-1">
                    {currentPlan.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Leads Used</span>
                    <span className="text-sm text-muted-foreground">
                      {planInfo.leadsUsed} / {planInfo.leadsTotal}
                    </span>
                  </div>
                  <Progress 
                    value={(planInfo.leadsUsed / planInfo.leadsTotal) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Requests Used</span>
                    <span className="text-sm text-muted-foreground">
                      {planInfo.requestsUsed} / {planInfo.requestsTotal}
                    </span>
                  </div>
                  <Progress 
                    value={(planInfo.requestsUsed / planInfo.requestsTotal) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Usage Warnings */}
      {planInfo.plan === 'free' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                    Trial Limitations
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    You have {planInfo.requestsRemaining} search requests and {planInfo.leadsAvailable} leads remaining in your trial.
                    Upgrade to Starter for unlimited requests and 250 leads per month.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Subscription Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Subscription Management
            </CardTitle>
            <CardDescription>
              Manage your subscription and billing preferences via Safepay
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {planInfo.plan === 'free' ? (
                <Button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90">
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade to Starter
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Billing History
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelSubscription}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Canceling...
                      </div>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Subscription
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
            
            {planInfo.plan !== 'free' && (
              <p className="text-xs text-muted-foreground">
                Canceling your subscription will downgrade you to the free plan at the end of your current billing period.
                You'll retain access to all features until then. Payments are processed securely via Safepay.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}