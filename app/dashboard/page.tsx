'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '../../components/ui/modern-card'
import { Button } from '../../components/ui/button'
import { AnimatedCounter } from '../../components/ui/animated-counter'
import { ProgressRing } from '../../components/ui/progress-ring'
import { FloatingElement, PulsingDot } from '../../components/ui/floating-elements'
import { StatsCard } from '../../components/ui/stats-card'
import { useToast } from '../../components/ui/toast'
import { useClerkAuth } from '../../lib/auth/clerk-context'
import { LeadSearchForm } from '../../components/lead-generation'
import { DashboardPricing } from '../../components/billing/dashboard-pricing'
import { 
  CreditCard, 
  BarChart3, 
  Zap, 
  TrendingUp, 
  Sparkles,
  Search,
  Target,
  Users,
  Globe,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

import { SearchFormData } from '../../types/lead-generation'

export default function DashboardPage() {
  const { addToast } = useToast()
  const { user } = useClerkAuth()
  const [planInfo, setPlanInfo] = useState<any>(null)

  useEffect(() => {
    fetchPlanInfo()
  }, [])

  const fetchPlanInfo = async () => {
    try {
      const response = await fetch('/api/user/plan-info')
      if (response.ok) {
        const data = await response.json()
        setPlanInfo(data)
      }
    } catch (error) {
      console.error('Error fetching plan info:', error)
    }
  }

  const handleGenerateLeads = async (searchForm: SearchFormData) => {
    try {
      // Check plan limits first
      if (planInfo && !planInfo.canMakeRequest) {
        addToast({
          type: 'error',
          title: 'Request Limit Reached',
          message: `You've used all ${planInfo.requestsTotal} requests for this month. Upgrade to continue.`,
        })
        return
      }

      if (planInfo && !planInfo.canGenerateLeads) {
        addToast({
          type: 'error',
          title: 'Lead Limit Reached',
          message: `You've used all ${planInfo.leadsTotal} leads for this month. Upgrade to continue.`,
        })
        return
      }

      const response = await fetch('/api/leads/generate-serper', { // Using Serper.dev for high-quality Google Maps data
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType: searchForm.businessType,
          country: searchForm.country,
          state: searchForm.state,
          city: searchForm.city,
          leadsCount: searchForm.leadsRequested
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh plan info
        await fetchPlanInfo()
        
        // Store leads in sessionStorage
        if (data.leads && data.leads.length > 0) {
          sessionStorage.setItem('generated_leads', JSON.stringify(data.leads))
          // Redirect to success page
          window.location.href = '/dashboard/generate/success'
        } else {
          addToast({
            type: 'warning',
            title: 'No Leads Found',
            message: 'Try different search criteria or location',
          })
        }
      } else {
        if (data.error && data.error.includes('limit exceeded')) {
          addToast({
            type: 'error',
            title: 'Limit Exceeded',
            message: data.error + '. Please upgrade your plan.',
          })
          await fetchPlanInfo() // Refresh to show updated limits
        } else {
          throw new Error(data.error || 'Failed to generate leads')
        }
      }
    } catch (error) {
      // Re-throw error to be handled by the form component
      throw error
    }
  }

  return (
    <div className="space-y-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <FloatingElement delay={0} className="absolute top-20 left-10 opacity-20">
          <PulsingDot size="sm" />
        </FloatingElement>
        <FloatingElement delay={2} className="absolute top-40 right-20 opacity-20">
          <PulsingDot size="md" />
        </FloatingElement>
        <FloatingElement delay={4} className="absolute bottom-40 left-1/4 opacity-20">
          <PulsingDot size="lg" />
        </FloatingElement>
      </div>

      {/* Enhanced Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6 py-8 relative"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary px-6 py-3 rounded-full text-sm font-medium border border-primary/20 backdrop-blur shadow-lg"
        >
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Lead Generation</span>
          <Target className="h-4 w-4" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold tracking-tight"
        >
          <span className="text-blue-600 dark:text-blue-400">
            Find Your Next Customers
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Generate high-quality business leads with AI precision. Target specific industries and locations to grow your business.
        </motion.p>
      </motion.div>

        {/* Enhanced Usage Stats with StatsCard */}
        {planInfo && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid gap-6 md:grid-cols-3"
          >
            <StatsCard
              title="Current Plan"
              value={planInfo.plan}
              icon={Zap}
              color="primary"
              animated={false}
            />
            
            <StatsCard
              title="Leads Available"
              value={planInfo.leadsAvailable}
              icon={TrendingUp}
              color="green"
              showProgress={true}
              progress={(planInfo.leadsAvailable / planInfo.leadsTotal) * 100}
            />
            
            <StatsCard
              title="Requests Left"
              value={`${planInfo.requestsRemaining}/${planInfo.requestsTotal}`}
              icon={Search}
              color="blue"
              showProgress={true}
              progress={(planInfo.requestsRemaining / planInfo.requestsTotal) * 100}
              animated={false}
            />
          </motion.div>
        )}

        {/* Lead Generation Form */}
        <LeadSearchForm onSearchSubmit={handleGenerateLeads} />

        {/* Enhanced Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid gap-6 md:grid-cols-2"
        >
          <ModernCard variant="interactive" className="border-0 shadow-lg group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <ModernCardHeader className="relative z-10">
              <ModernCardTitle className="flex items-center space-x-3 group-hover:text-blue-600 transition-colors duration-300">
                <motion.div 
                  className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </motion.div>
                <span>View Results</span>
              </ModernCardTitle>
              <ModernCardDescription className="group-hover:text-foreground/80 transition-colors duration-300 text-base">
                Review and manage your generated leads and search history
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent className="relative z-10">
              <Button 
                variant="outline" 
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-lg group/btn"
                asChild
              >
                <Link href="/dashboard/leads">
                  <BarChart3 className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                  View Lead Results
                  <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </ModernCardContent>
          </ModernCard>

          <ModernCard variant="interactive" className="border-0 shadow-lg group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <ModernCardHeader className="relative z-10">
              <ModernCardTitle className="flex items-center space-x-3 group-hover:text-green-600 transition-colors duration-300">
                <motion.div 
                  className="p-3 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors duration-300"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                >
                  <CreditCard className="h-6 w-6 text-green-600" />
                </motion.div>
                <span>Billing & Usage</span>
              </ModernCardTitle>
              <ModernCardDescription className="group-hover:text-foreground/80 transition-colors duration-300 text-base">
                Manage your subscription and view usage analytics
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent className="relative z-10">
              <Button 
                variant="outline" 
                className="w-full border-green-200 text-green-700 hover:bg-green-600 hover:text-white hover:border-green-600 hover:shadow-lg group/btn"
                asChild
              >
                <Link href="/dashboard/billing">
                  <CreditCard className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                  Manage Billing
                  <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </ModernCardContent>
          </ModernCard>
        </motion.div>

        {/* Enhanced Pricing Plans Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12"
        >
          <DashboardPricing />
        </motion.div>
      </div>
  )
}