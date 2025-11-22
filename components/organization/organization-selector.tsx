'use client'

import React, { useState } from 'react'
import { useOrganization } from '../../lib/organization/organization-context'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Badge } from '../ui/badge'
import { Building2, ChevronDown, Check, Crown, Shield, User } from 'lucide-react'

export function OrganizationSelector() {
  const { activeOrganization, userOrganizations, switchOrganization, loading } = useOrganization()
  const [isOpen, setIsOpen] = useState(false)

  const getRoleIcon = (role: 'owner' | 'admin' | 'member') => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3 text-yellow-500" />
      case 'admin':
        return <Shield className="h-3 w-3 text-blue-500" />
      case 'member':
        return <User className="h-3 w-3 text-gray-500" />
    }
  }

  const getRoleBadgeVariant = (role: 'owner' | 'admin' | 'member') => {
    switch (role) {
      case 'owner':
        return 'default' as const
      case 'admin':
        return 'secondary' as const
      case 'member':
        return 'outline' as const
    }
  }

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'trial':
        return 'outline' as const
      case 'starter':
        return 'secondary' as const
      case 'growth':
        return 'default' as const
      case 'agency':
        return 'destructive' as const
      default:
        return 'outline' as const
    }
  }

  const handleOrganizationSwitch = async (orgId: string) => {
    if (orgId !== activeOrganization?.id) {
      await switchOrganization(orgId)
    }
    setIsOpen(false)
  }

  if (!activeOrganization) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Building2 className="h-4 w-4" />
        <span>No organization selected</span>
      </div>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between max-w-xs"
          disabled={loading}
        >
          <div className="flex items-center space-x-2 min-w-0">
            <Building2 className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{activeOrganization.name}</span>
            <Badge variant={getPlanBadgeVariant(activeOrganization.plan)} className="text-xs">
              {activeOrganization.plan}
            </Badge>
          </div>
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="start">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Organizations</span>
          <Badge variant="outline" className="text-xs">
            {userOrganizations.length} total
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {userOrganizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleOrganizationSwitch(org.id)}
            className="flex items-center justify-between p-3 cursor-pointer"
          >
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <Building2 className="h-4 w-4 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium truncate">{org.name}</span>
                    {org.id === activeOrganization.id && (
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={getRoleBadgeVariant(org.role)} className="text-xs">
                      <div className="flex items-center space-x-1">
                        {getRoleIcon(org.role)}
                        <span>{org.role}</span>
                      </div>
                    </Badge>
                    <Badge variant={getPlanBadgeVariant(org.plan)} className="text-xs">
                      {org.plan}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {org.plan === 'trial' ? (
                <span>{2 - org.trial_searches_used} trials left</span>
              ) : (
                <span>{org.credits} credits</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}