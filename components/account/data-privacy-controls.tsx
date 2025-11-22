'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { useToast } from '../ui/toast'
import { 
  Shield, 
  Download, 
  Trash2, 
  Eye, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Lock
} from 'lucide-react'

interface DataPrivacyControlsProps {
  className?: string
}

export function DataPrivacyControls({ className = "" }: DataPrivacyControlsProps) {
  const { addToast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/user/export-data', {
        method: 'POST'
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `evo-lead-ai-data-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        addToast({
          type: 'success',
          title: 'Data Exported',
          message: 'Your data has been exported successfully.'
        })
      } else {
        throw new Error('Failed to export data')
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export your data. Please try again.'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleRequestDeletion = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch('/api/user/request-deletion', {
        method: 'POST'
      })

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Deletion Requested',
          message: 'Your data deletion request has been submitted. You will receive a confirmation email.'
        })
      } else {
        throw new Error('Failed to request deletion')
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Request Failed',
        message: 'Failed to submit deletion request. Please contact support.'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const privacyFeatures = [
    {
      title: 'Data Encryption',
      description: 'All your data is encrypted in transit and at rest',
      status: 'active',
      icon: Lock
    },
    {
      title: 'Access Logging',
      description: 'We log all access to your data for security monitoring',
      status: 'active',
      icon: Eye
    },
    {
      title: 'Data Retention',
      description: 'Your data is retained according to our privacy policy',
      status: 'active',
      icon: Clock
    },
    {
      title: 'Third-party Sharing',
      description: 'We do not share your personal data with third parties',
      status: 'protected',
      icon: Shield
    }
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Shield className="h-5 w-5" />
          Data Privacy & Controls
        </CardTitle>
        <CardDescription>
          Manage your data privacy settings and exercise your rights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Privacy Features Overview */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Privacy Protection Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {privacyFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                <div className={`p-2 rounded-lg ${
                  feature.status === 'active' ? 'bg-green-100 text-green-600' : 
                  feature.status === 'protected' ? 'bg-blue-100 text-blue-600' : 
                  'bg-gray-100 text-gray-600'
                }`}>
                  <feature.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">{feature.title}</h5>
                    <Badge 
                      variant={feature.status === 'active' ? 'default' : 'secondary'}
                      className={
                        feature.status === 'active' ? 'bg-green-500 text-white' :
                        feature.status === 'protected' ? 'bg-blue-500 text-white' :
                        ''
                      }
                    >
                      {feature.status === 'active' ? 'Active' : 
                       feature.status === 'protected' ? 'Protected' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Data Rights */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Your Data Rights</h4>
          
          {/* Export Data */}
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Export Your Data
                </h5>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Download a complete copy of all your data including profile, searches, and leads
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleExportData} 
              disabled={isExporting}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>

          {/* Data Portability */}
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h5 className="text-sm font-medium text-green-900 dark:text-green-100">
                  Data Portability
                </h5>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Your exported data is in a standard JSON format for easy portability
                </p>
              </div>
            </div>
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Available
            </Badge>
          </div>

          {/* Data Correction */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <Eye className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Data Correction
                </h5>
                <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                  Request corrections to any inaccurate personal data we hold
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </div>
        </div>

        <Separator />

        {/* Data Deletion */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-100">
              Data Deletion
            </h4>
          </div>
          
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Trash2 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    Request Data Deletion
                  </h5>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                    Request permanent deletion of your account and all associated data
                  </p>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      • This action cannot be undone
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      • All your searches and leads will be permanently deleted
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      • You will receive a confirmation email before deletion
                    </p>
                  </div>
                </div>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleRequestDeletion}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Requesting...' : 'Request Deletion'}
              </Button>
            </div>
          </div>
        </div>

        {/* Privacy Policy Link */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Learn more about how we protect your data
            </span>
            <Button variant="link" size="sm" asChild>
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}