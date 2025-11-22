'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'
import { useToast } from '../ui/toast'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  TrendingUp, 
  Shield,
  Save,
  Check,
  X
} from 'lucide-react'

interface NotificationSettings {
  emailNotifications: boolean
  marketingEmails: boolean
  securityAlerts: boolean
  usageAlerts: boolean
  weeklyReports: boolean
  productUpdates: boolean
}

interface NotificationPreferencesProps {
  className?: string
}

export function NotificationPreferences({ className = "" }: NotificationPreferencesProps) {
  const { addToast } = useToast()
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    marketingEmails: false,
    securityAlerts: true,
    usageAlerts: true,
    weeklyReports: false,
    productUpdates: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadNotificationSettings()
  }, [])

  const loadNotificationSettings = async () => {
    try {
      const response = await fetch('/api/user/notification-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error loading notification settings:', error)
    }
  }

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/notification-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })

      if (response.ok) {
        setHasChanges(false)
        addToast({
          type: 'success',
          title: 'Settings Saved',
          message: 'Your notification preferences have been updated successfully.'
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to save notification settings. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const NotificationToggle = ({ 
    enabled, 
    onChange, 
    title, 
    description, 
    icon: Icon 
  }: {
    enabled: boolean
    onChange: (value: boolean) => void
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
  }) => (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${enabled ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <Label className="text-sm font-medium cursor-pointer" onClick={() => onChange(!enabled)}>
            {title}
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(!enabled)}
        className={`${enabled ? 'border-green-500 text-green-600 hover:bg-green-50' : 'border-red-300 text-red-600 hover:bg-red-50'}`}
      >
        {enabled ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
      </Button>
    </div>
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Control how and when you receive notifications from Evo Lead AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Essential Notifications */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="h-1 w-8 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
            <h4 className="text-sm font-semibold text-foreground">Essential Notifications</h4>
          </div>
          
          <NotificationToggle
            enabled={settings.emailNotifications}
            onChange={(value) => handleSettingChange('emailNotifications', value)}
            title="Email Notifications"
            description="Receive important account and service notifications via email"
            icon={Mail}
          />
          
          <NotificationToggle
            enabled={settings.securityAlerts}
            onChange={(value) => handleSettingChange('securityAlerts', value)}
            title="Security Alerts"
            description="Get notified about login attempts and security-related activities"
            icon={Shield}
          />
          
          <NotificationToggle
            enabled={settings.usageAlerts}
            onChange={(value) => handleSettingChange('usageAlerts', value)}
            title="Usage Alerts"
            description="Receive alerts when approaching plan limits or usage thresholds"
            icon={TrendingUp}
          />
        </div>

        <Separator />

        {/* Optional Notifications */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="h-1 w-8 bg-gradient-to-r from-muted-foreground to-muted-foreground/50 rounded-full"></div>
            <h4 className="text-sm font-semibold text-foreground">Optional Communications</h4>
          </div>
          
          <NotificationToggle
            enabled={settings.marketingEmails}
            onChange={(value) => handleSettingChange('marketingEmails', value)}
            title="Marketing Communications"
            description="Receive updates about new features, promotions, and company news"
            icon={MessageSquare}
          />
          
          <NotificationToggle
            enabled={settings.weeklyReports}
            onChange={(value) => handleSettingChange('weeklyReports', value)}
            title="Weekly Usage Reports"
            description="Get weekly summaries of your lead generation activity and performance"
            icon={TrendingUp}
          />
          
          <NotificationToggle
            enabled={settings.productUpdates}
            onChange={(value) => handleSettingChange('productUpdates', value)}
            title="Product Updates"
            description="Stay informed about new features, improvements, and platform updates"
            icon={Bell}
          />
        </div>

        <Separator />

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            {hasChanges ? 'You have unsaved changes' : 'All changes saved'}
          </div>
          <Button 
            onClick={handleSaveSettings} 
            disabled={isLoading || !hasChanges}
            className="min-w-[120px]"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Email Preferences Note */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Email Delivery Information
              </h5>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Notifications will be sent to your primary email address. You can unsubscribe from marketing emails at any time using the link in the email footer.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}