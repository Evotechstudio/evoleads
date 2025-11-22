'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { 
  Sparkles, 
  Zap, 
  Search, 
  BarChart3, 
  Users, 
  CreditCard,
  Bell,
  Settings,
  FileText
} from 'lucide-react'

export default function UIDemoPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <span>Updated UI Demo</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Showcasing the enhanced navbar and sidebar design with modern UI elements
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          New Design
        </Badge>
      </div>

      {/* UI Features Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Enhanced Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary" />
              <span>Enhanced Logo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50 border">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-base bg-linear-to-r from-foreground to-foreground/80 bg-clip-text">
                  Evo Lead AI
                </span>
                <div className="flex items-center space-x-1 -mt-0.5">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-xs text-muted-foreground font-medium">
                    AI-Powered
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Modern gradient logo with AI branding and improved visual hierarchy
            </p>
          </CardContent>
        </Card>

        {/* Navigation Improvements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-primary" />
              <span>Smart Navigation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {[
                { icon: Search, label: 'Generate', active: true },
                { icon: FileText, label: 'Leads', active: false },
                { icon: BarChart3, label: 'Analytics', active: false }
              ].map((item, index) => (
                <div 
                  key={index}
                  className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${
                    item.active 
                      ? 'bg-accent text-accent-foreground border-l-2 border-primary' 
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${
                    item.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  }`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.active && (
                    <div className="ml-auto w-1 h-1 bg-primary rounded-full" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Active states with visual indicators and smooth hover effects
            </p>
          </CardContent>
        </Card>

        {/* Organization Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Organization Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-muted/50 border">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Demo Organization</span>
              <Badge variant="outline" className="text-xs">
                trial
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Trials Remaining</span>
                <span className="font-medium">2/2</span>
              </div>
              <div className="w-full bg-muted-foreground/20 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-orange-500 transition-all duration-300" style={{ width: '100%' }} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Real-time organization status with usage indicators
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-linear-to-r from-primary/10 to-primary/5 border-primary/20"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Contextual actions with notification badges and upgrade prompts
            </p>
          </CardContent>
        </Card>

        {/* Mobile Responsive */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span>Mobile Responsive</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Demo Organization</span>
                  <Badge variant="outline">trial</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  2 trials remaining
                </div>
                <Button size="sm" className="w-full mt-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Upgrade Plan
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Optimized mobile navigation with collapsible organization info
            </p>
          </CardContent>
        </Card>

        {/* Visual Enhancements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>Visual Polish</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-primary rounded-full animate-pulse" />
                <span className="text-sm">Subtle animations</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-linear-to-r from-primary to-primary/80 rounded-full" />
                <span className="text-sm">Gradient accents</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-accent rounded-full shadow-sm" />
                <span className="text-sm">Enhanced shadows</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-muted border rounded-full" />
                <span className="text-sm">Improved borders</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Modern design elements with smooth transitions and visual feedback
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Improvements Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Key UI Improvements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Enhanced Branding</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Modern gradient logo design</li>
                <li>• AI-powered branding elements</li>
                <li>• Consistent visual identity</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Improved Navigation</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Clear active state indicators</li>
                <li>• Contextual organization status</li>
                <li>• Quick action accessibility</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Better UX</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Smooth hover transitions</li>
                <li>• Visual usage indicators</li>
                <li>• Mobile-optimized layout</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}