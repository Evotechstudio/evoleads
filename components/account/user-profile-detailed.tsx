'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useClerkAuth } from '../../lib/auth/clerk-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { 
  User, 
  Mail, 
  Calendar, 
  Clock,
  Shield
} from 'lucide-react'

interface UsageHistory {
  date: string
  action: string
  details: string
  creditsUsed?: number
}

interface DetailedUserProfileProps {
  showUsageHistory?: boolean
  showAnalytics?: boolean
  className?: string
}

export function DetailedUserProfile({ 
  showUsageHistory = true, 
  showAnalytics = true,
  className = ""
}: DetailedUserProfileProps) {
  const { user } = useUser()
  const { metadata } = useClerkAuth()
  const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (showUsageHistory && user) {
      loadUsageHistory()
    }
  }, [showUsageHistory, user])

  const loadUsageHistory = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would fetch from your database
      // For now, we'll create mock data based on user metadata
      const mockHistory: UsageHistory[] = [
        {
          date: new Date().toISOString(),
          action: 'Account Created',
          details: 'Welcome to Evo Lead AI!'
        }
      ]

      if (metadata?.trialRequests && metadata.trialRequests > 0) {
        for (let i = 0; i < metadata.trialRequests; i++) {
          mockHistory.push({
            date: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
            action: 'Lead Search',
            details: `Generated leads for business search #${metadata.trialRequests - i}`,
            creditsUsed: 1
          })
        }
      }

      setUsageHistory(mockHistory.reverse())
    } catch (error) {
      console.error('Error loading usage history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || !metadata) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Enhanced User Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <User className="h-5 w-5" />
            Profile Overview
          </CardTitle>
          <CardDescription>
            Your account information and current status
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarImage src={user.imageUrl} alt={user.fullName || 'User'} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {user.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-2xl font-bold mb-2">{user.fullName || 'User'}</h3>
                <div className="flex items-center text-muted-foreground mb-3">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm">{user.primaryEmailAddress?.emailAddress}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Joined {new Date(user.createdAt!).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Last active {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'Recently'}</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-600" />
                  <span>Account verified</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Usage History */}
      {showUsageHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your recent account activity and usage history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading activity...</p>
              </div>
            ) : usageHistory.length > 0 ? (
              <div className="space-y-4">
                {usageHistory.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.action}</div>
                      <div className="text-xs text-muted-foreground">{item.details}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                    {item.creditsUsed && (
                      <Badge variant="outline" className="text-xs">
                        -{item.creditsUsed} credit
                      </Badge>
                    )}
                  </div>
                ))}
                {usageHistory.length > 5 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" size="sm">
                      View All Activity
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No activity yet</p>
                <p className="text-sm text-muted-foreground">Start using Evo Lead AI to see your activity here</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}