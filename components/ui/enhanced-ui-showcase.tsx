'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { Separator } from './separator'
import { CheckCircle, Sparkles, Palette, Zap, Shield, Users } from 'lucide-react'

export function EnhancedUIShowcase() {
  const improvements = [
    {
      category: 'Toast Notifications',
      icon: <Sparkles className="h-5 w-5" />,
      color: 'bg-blue-500',
      features: [
        'Enhanced animations with slide-in effects',
        'Better positioning and responsive layout',
        'Improved color schemes for dark/light modes',
        'Action buttons with proper spacing',
        'Persistent toasts for critical errors'
      ]
    },
    {
      category: 'Error Messages',
      icon: <Shield className="h-5 w-5" />,
      color: 'bg-red-500',
      features: [
        'Contextual icons with proper color coding',
        'Expandable technical details section',
        'Enhanced visual hierarchy',
        'Better spacing and typography',
        'Improved accessibility with ARIA labels'
      ]
    },
    {
      category: 'Confirmation Modals',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'bg-green-500',
      features: [
        'Better visual hierarchy with icons',
        'Enhanced consequence listing',
        'Improved typing confirmation UX',
        'Loading states with spinners',
        'Responsive button layouts'
      ]
    },
    {
      category: 'Onboarding Tooltips',
      icon: <Users className="h-5 w-5" />,
      color: 'bg-purple-500',
      features: [
        'Smooth animations and transitions',
        'Enhanced backdrop with blur effects',
        'Better progress indicators',
        'Improved spotlight effects',
        'Modern card design with shadows'
      ]
    },
    {
      category: 'Error Boundaries',
      icon: <Zap className="h-5 w-5" />,
      color: 'bg-orange-500',
      features: [
        'Enhanced error reporting UI',
        'Better development error details',
        'Improved action button layouts',
        'Gradient backgrounds for visual appeal',
        'Expandable error information'
      ]
    },
    {
      category: 'Tooltips & Help',
      icon: <Palette className="h-5 w-5" />,
      color: 'bg-indigo-500',
      features: [
        'Better hover states and transitions',
        'Enhanced content formatting',
        'Improved keyboard navigation',
        'Better positioning algorithms',
        'Consistent design language'
      ]
    }
  ]

  return (
    <div className="space-y-10 p-8 max-w-6xl mx-auto bg-gradient-to-br from-blue-50/30 via-white to-blue-100/30 dark:from-blue-950/10 dark:via-background dark:to-blue-900/10 min-h-screen">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-full border-2 border-blue-200 dark:border-blue-800 shadow-lg">
          <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <span className="text-blue-700 dark:text-blue-300 font-bold text-lg">Enhanced UI Components</span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent leading-tight">
          Comprehensive Error Handling & User Feedback
        </h1>
        <p className="text-xl text-blue-700 dark:text-blue-300 max-w-4xl mx-auto leading-relaxed font-medium">
          Modern, accessible, and user-friendly components built with shadcn/ui patterns, 
          featuring beautiful blue gradients, enhanced animations, better visual hierarchy, and improved user experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {improvements.map((improvement, index) => (
          <Card key={index} className="relative overflow-hidden border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 bg-gradient-to-br from-white to-blue-50/50 dark:from-background dark:to-blue-950/20">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-500/5 to-blue-600/5 border-b border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${improvement.color} text-white shadow-lg`}>
                  {improvement.icon}
                </div>
                <div>
                  <CardTitle className="text-xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 bg-clip-text text-transparent font-bold">
                    {improvement.category}
                  </CardTitle>
                  <Badge className="mt-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md">
                    {improvement.features.length} improvements
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {improvement.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      <Card className="border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-500/10 to-blue-600/10 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-b border-blue-300 dark:border-blue-700">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Sparkles className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 bg-clip-text text-transparent font-bold">
              Key Improvements Summary
            </span>
          </CardTitle>
          <CardDescription className="text-lg text-blue-700 dark:text-blue-300 font-medium">
            All components now follow shadcn/ui design patterns with enhanced accessibility, beautiful blue gradients, and modern animations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-bold text-lg bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">Design Enhancements</h4>
              <ul className="text-base text-blue-700 dark:text-blue-300 space-y-2 font-medium">
                <li>• Beautiful blue gradient color schemes for light/dark modes</li>
                <li>• Enhanced animations and smooth transitions</li>
                <li>• Better visual hierarchy and generous spacing</li>
                <li>• Modern card designs with enhanced shadows</li>
                <li>• Improved typography and readability</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-lg bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">UX Improvements</h4>
              <ul className="text-base text-blue-700 dark:text-blue-300 space-y-2 font-medium">
                <li>• Better loading states with gradient feedback</li>
                <li>• Enhanced accessibility features</li>
                <li>• Improved keyboard navigation</li>
                <li>• Responsive layouts for all screen sizes</li>
                <li>• Contextual help and guidance</li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 pt-6">
            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md px-4 py-2 text-sm font-semibold">shadcn/ui patterns</Badge>
            <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-md px-4 py-2 text-sm font-semibold">Radix UI primitives</Badge>
            <Badge className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-0 shadow-md px-4 py-2 text-sm font-semibold">Tailwind CSS</Badge>
            <Badge className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0 shadow-md px-4 py-2 text-sm font-semibold">TypeScript</Badge>
            <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md px-4 py-2 text-sm font-semibold">Accessibility</Badge>
            <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md px-4 py-2 text-sm font-semibold">Responsive design</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}