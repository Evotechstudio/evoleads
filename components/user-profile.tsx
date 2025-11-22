'use client'

import React from 'react'
import { useUser } from '@clerk/nextjs'
import { useClerkAuth } from '../lib/auth/clerk-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Progress } from './ui/progress'
import { 
  User, 
  Mail, 
  Calendar, 
  CreditCard, 
  Zap, 
  Star, 
  Crown,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

export function UserProfile() {
  const { user } = useUser()
  const { metadata } = useClerkAuth()

  if (!user || !metadata) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </CardContent>
      </Card>
    )
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'starter':
        return Star
      case 'pro':
        return Crown
      default:
        return Zap
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter':
        return 'from-blue-500 to-purple-600'
      case 'pro':
        return 'from-purple-500 to-pink-600'
      default:
        return 'from-gray-400 to-gray-600'
    }
  }

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'starter':
        return 'Starter Plan'
      case 'pro':
        return 'Pro Plan'
      default:
        return 'Trial Plan'
    }
  }

  const getUsageStats = () => {
    if (metadata.plan === 'trial') {
      return {
        leadsUsed: metadata.leadsUsed || 0,
        leadsLimit: 20,
        requestsUsed: metadata.trialRequests || 0,
        requestsLimit: 2
      }
    } else if (metadata.plan === 'starter') {
      return {
        leadsUsed: metadata.leadsUsed || 0,
        leadsLimit: 250,
        requestsUsed: 0, // Unlimited
        requestsLimit: Infinity
      }
    }
    return {
      leadsUsed: 0,
      leadsLimit: 0,
      requestsUsed: 0,
      requestsLimit: 0
    }
  }

  const PlanIcon = getPlanIcon(metadata.plan)
  const planColor = getPlanColor(metadata.plan)
  const planName = getPlanName(metadata.plan)
  const usageStats = getUsageStats()

  return (
    <div className="space-y-6">
      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <User className="h-5 w-5" />
            User Profile
          </CardTitle>
          <CardDescription>
            Your account information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.imageUrl} alt={user.fullName || 'User'} />
              <AvatarFallback>
                {user.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{user.fullName || 'User'}</h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mr-2" />
                {user.primaryEmailAddress?.emailAddress}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Joined {new Date(user.createdAt!).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${planColor} text-white`}>
              <PlanIcon className="h-5 w-5" />
            </div>
            {planName}
          </CardTitle>
          <CardDescription>
            Your current subscription plan and usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Plan Status</span>
            <Badge 
              variant={metadata.plan === 'trial' ? 'outline' : 'default'}
              className={metadata.plan !== 'trial' ? 'bg-green-500 text-white' : ''}
            >
              {metadata.plan === 'trial' ? 'Trial' : 'Active'}
            </Badge>
          </div>

          {/* Plan ID Display */}
          {metadata.plan === 'starter' && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Plan ID</span>
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                cplan_34n96CAT3Px6QokfOSAiFLybroyW
              </code>
            </div>
          )}

          <div className="space-y-4">
            {/* Leads Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Leads Used</span>
                <span className="text-sm text-muted-foreground">
                  {usageStats.leadsUsed} / {usageStats.leadsLimit === Infinity ? '∞' : usageStats.leadsLimit}
                </span>
              </div>
              <Progress 
                value={usageStats.leadsLimit === Infinity ? 0 : (usageStats.leadsUsed / usageStats.leadsLimit) * 100} 
                className="h-2"
              />
            </div>

            {/* Requests Usage (Trial only) */}
            {metadata.plan === 'trial' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Search Requests</span>
                  <span className="text-sm text-muted-foreground">
                    {usageStats.requestsUsed} / {usageStats.requestsLimit}
                  </span>
                </div>
                <Progress 
                  value={(usageStats.requestsUsed / usageStats.requestsLimit) * 100} 
                  className="h-2"
                />
              </div>
            )}
          </div>

          {/* Plan Features */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Plan Features</h4>
            <div className="grid grid-cols-1 gap-2">
              {metadata.plan === 'trial' ? (
                <>
                  <div className="text-sm text-muted-foreground">• 2 search requests</div>
                  <div className="text-sm text-muted-foreground">• 20 leads total</div>
                  <div className="text-sm text-muted-foreground">• Basic support</div>
                </>
              ) : metadata.plan === 'starter' ? (
                <>
                  <div className="text-sm text-muted-foreground">• Unlimited search requests</div>
                  <div className="text-sm text-muted-foreground">• 250 leads per month</div>
                  <div className="text-sm text-muted-foreground">• Priority support</div>
                  <div className="text-sm text-muted-foreground">• Advanced features</div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">• Coming soon</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1">
              <Link href="/dashboard/billing">
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Billing
              </Link>
            </Button>
            {metadata.plan === 'trial' && (
              <Button asChild variant="outline" className="flex-1">
                <Link href="/dashboard/billing">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}