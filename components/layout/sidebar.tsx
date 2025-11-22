'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useClerkAuth } from '../../lib/auth/clerk-context'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import {
  Search,
  CreditCard,
  Settings,
  FileText,
  HelpCircle,
  Zap,
  X,
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface SidebarProps {
  className?: string
  onClose?: () => void
}

interface PlanInfo {
  plan: string
  leadsUsed: number
  leadsTotal: number
  requestsUsed: number
  requestsRemaining: number
  requestsTotal: number
  canMakeRequest: boolean
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  description?: string
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { isSignedIn } = useClerkAuth()
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
    
    // Refresh plan info every 30 seconds
    const interval = setInterval(fetchPlanInfo, 30000)
    return () => clearInterval(interval)
  }, [isSignedIn])

  const mainNavItems: NavItem[] = [
    {
      title: 'Lead Search',
      href: '/dashboard',
      icon: Search,
      description: 'Find and generate new leads',
    },
    {
      title: 'Lead Management',
      href: '/dashboard/leads',
      icon: FileText,
      description: 'Manage your lead results',
    },
  ]

  const settingsNavItems: NavItem[] = [
    {
      title: 'Billing & Plans',
      href: '/dashboard/billing',
      icon: CreditCard,
      badge: planInfo?.plan === 'free' ? 'Free' : undefined,
      description: 'Manage subscription & billing',
    },
    {
      title: 'Account Settings',
      href: '/dashboard/account',
      icon: Settings,
      description: 'Profile & preferences',
    },
    {
      title: 'Help & Support',
      href: '/dashboard/help',
      icon: HelpCircle,
      description: 'Documentation & support',
    },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const handleNavClick = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className={cn(
      'flex h-full w-72 flex-col border-r bg-background shadow-xl',
      className
    )}>
      {/* Mobile Header with Close Button */}
      {onClose && (
        <div className="flex h-20 items-center justify-between border-b border-border/50 px-6 md:hidden bg-background">
          <Link href="/" className="flex items-center space-x-3" onClick={handleNavClick}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
              <Zap className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg">Evo Lead AI</span>
              <span className="text-xs text-muted-foreground">AI-Powered Lead Generation</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-4 p-4 overflow-y-auto bg-background">
        {/* Main Navigation */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-1 w-8 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Lead Generation
            </h3>
          </div>
          {mainNavItems.map((item) => (
            <Button
              key={item.href}
              variant={isActive(item.href) ? 'default' : 'ghost'}
              className={`w-full justify-start h-auto p-3 rounded-xl transition-all duration-200 ${
                isActive(item.href) 
                  ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg hover:shadow-xl' 
                  : 'hover:bg-primary/5 hover:scale-[1.02]'
              }`}
              asChild
              onClick={handleNavClick}
            >
              <Link href={item.href}>
                <div className="flex items-center space-x-3 w-full min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    isActive(item.href) 
                      ? 'bg-white/20' 
                      : 'bg-primary/10'
                  }`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm truncate">{item.title}</span>
                      {item.badge && (
                        <Badge variant={isActive(item.href) ? 'secondary' : 'outline'} className="text-xs shrink-0">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className={`text-xs mt-1 leading-relaxed ${
                        isActive(item.href) 
                          ? 'text-primary-foreground/80' 
                          : 'text-muted-foreground'
                      }`}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>

        <Separator className="my-4 bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Settings Navigation */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-1 w-8 bg-gradient-to-r from-muted-foreground to-muted-foreground/50 rounded-full"></div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Settings
            </h3>
          </div>
          {settingsNavItems.map((item) => (
            <Button
              key={item.href}
              variant={isActive(item.href) ? 'default' : 'ghost'}
              className={`w-full justify-start h-auto p-3 rounded-xl transition-all duration-200 ${
                isActive(item.href) 
                  ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg hover:shadow-xl' 
                  : 'hover:bg-primary/5 hover:scale-[1.02]'
              }`}
              asChild
              onClick={handleNavClick}
            >
              <Link href={item.href}>
                <div className="flex items-center space-x-3 w-full min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    isActive(item.href) 
                      ? 'bg-white/20' 
                      : 'bg-primary/10'
                  }`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm truncate">{item.title}</span>
                      {item.badge && (
                        <Badge variant={isActive(item.href) ? 'secondary' : 'outline'} className="text-xs shrink-0">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className={`text-xs mt-1 leading-relaxed ${
                        isActive(item.href) 
                          ? 'text-primary-foreground/80' 
                          : 'text-muted-foreground'
                      }`}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </nav>

      {/* Footer - Credits/Plan Info */}
      {!loading && planInfo && (
        <div className="border-t border-border/50 p-4 bg-background">
          <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-4 space-y-3 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-sm font-medium text-foreground">Current Plan</span>
              </div>
              <Badge 
                variant={planInfo.plan === 'free' ? 'outline' : 'default'}
                className={`capitalize font-semibold ${
                  planInfo.plan === 'free' 
                    ? 'border-orange-300 text-orange-700 bg-orange-50' 
                    : 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground'
                }`}
              >
                {planInfo.plan}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {/* Requests Left */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium truncate">
                  Requests Left
                </span>
                <span className="font-bold text-foreground shrink-0">
                  {planInfo.requestsRemaining}/{planInfo.requestsTotal}
                </span>
              </div>
              
              {/* Progress Bar for Requests */}
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-orange-400 to-orange-600"
                  style={{
                    width: `${(planInfo.requestsRemaining / planInfo.requestsTotal) * 100}%`
                  }}
                ></div>
              </div>

              {/* Leads Used */}
              <div className="flex items-center justify-between text-sm pt-2">
                <span className="text-muted-foreground font-medium truncate">
                  Leads Used
                </span>
                <span className="font-bold text-foreground shrink-0">
                  {planInfo.leadsUsed}/{planInfo.leadsTotal}
                </span>
              </div>
              
              {/* Progress Bar for Leads */}
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-primary to-primary/80"
                  style={{
                    width: `${(planInfo.leadsUsed / planInfo.leadsTotal) * 100}%`
                  }}
                ></div>
              </div>
            </div>
            
            {planInfo.plan === 'free' && (
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl" 
                asChild
              >
                <Link href="/dashboard/billing" onClick={handleNavClick}>
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}