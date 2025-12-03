'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { DashboardPricing } from '../../../components/billing/dashboard-pricing'
import { useClerkAuth } from '../../../lib/auth/clerk-context'
import { useToast } from '../../../components/ui/toast'
import { CreditCard, TrendingUp, Zap, CheckCircle, XCircle } from 'lucide-react'

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

function BillingPageContent() {
  const { user, isSignedIn } = useClerkAuth()
  const { addToast } = useToast()
  const searchParams = useSearchParams()
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch plan info from API
  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false)
      return
    }

    const fetchPlanInfo = async () => {
      try {
        const response = await fetch('/api/user/plan-info')
        if (response.ok) {
          const data = await response.json()
          setPlanInfo(data)
        }
      } catch (error) {
        console.error('Error fetching plan info:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlanInfo()
  }, [isSignedIn])

  // Handle payment success/cancel redirects
  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    const sessionId = searchParams.get('session_id')

    if (success === 'true') {
      addToast({
        type: 'success',
        title: 'Payment Successful!',
        message: 'Your subscription has been activated. Welcome to the Starter plan!'
      })
      
      // Clear URL parameters
      window.history.replaceState({}, '', '/dashboard/billing')
    } else if (canceled === 'true') {
      addToast({
        type: 'info',
        title: 'Payment Canceled',
        message: 'Your payment was canceled. You can try again anytime.'
      })
      
      // Clear URL parameters
      window.history.replaceState({}, '', '/dashboard/billing')
    }
  }, [searchParams, addToast])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please sign in to manage your billing.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-8">
        {/* Success/Cancel Status Cards */}
        {searchParams.get('success') === 'true' && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">
                    Welcome to the Starter Plan!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your subscription is now active. You have unlimited search requests and 250 leads per month.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {searchParams.get('canceled') === 'true' && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <XCircle className="h-6 w-6 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                    Payment Canceled
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    No worries! You can upgrade to the Starter plan anytime below.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
            <p className="text-muted-foreground">
              Manage your subscription and view usage statistics
            </p>
          </div>
        </div>

        {/* Current Subscription Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6 lg:col-span-3">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Plan</span>
                  <span className="font-medium capitalize">{planInfo?.plan || 'Free'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Leads Used</span>
                  <span className="font-medium">{planInfo?.leadsUsed || 0} / {planInfo?.leadsTotal || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Requests Used</span>
                  <span className="font-medium">{planInfo?.requestsUsed || 0} / {planInfo?.requestsTotal || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Prompt for Free Users */}
            {planInfo?.plan === 'free' && (
              <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <CardContent className="p-6">
                  <div className="text-center space-y-3">
                    <Zap className="h-8 w-8 text-blue-600 mx-auto" />
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                      Unlock More Leads
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Upgrade to Starter for unlimited requests and 250 leads per month.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="space-y-6">
          <DashboardPricing />
        </div>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>
              Important details about your subscription and billing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">Payment & Security</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Secure payments powered by Safepay</li>
                  <li>• Local Pakistani payment methods</li>
                  <li>• Bank transfers and mobile wallets</li>
                  <li>• 256-bit SSL encryption</li>
                  <li>• PCI DSS compliant</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Subscription Details</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Monthly billing cycle</li>
                  <li>• Cancel anytime</li>
                  <li>• No setup fees</li>
                  <li>• 24/7 customer support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <BillingPageContent />
    </Suspense>
  )
}