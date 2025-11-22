'use client'

import React from 'react'
import { useAuth } from '../../lib/auth/auth-context'
import { useOrganization } from '../../lib/organization/organization-context'
import { OrganizationSetup } from './organization-setup'
import { Loader2 } from 'lucide-react'

interface OrganizationWrapperProps {
  children: React.ReactNode
}

export function OrganizationWrapper({ children }: OrganizationWrapperProps) {
  const { user, loading: authLoading } = useAuth()
  const { activeOrganization, userOrganizations, loading: orgLoading, refreshOrganizations } = useOrganization()

  // Show loading while auth or organization data is loading
  if (authLoading || (user && orgLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated but has no organizations, show setup
  if (user && userOrganizations.length === 0) {
    return <OrganizationSetup onComplete={refreshOrganizations} />
  }

  // If user is authenticated but no active organization is selected, show setup
  if (user && userOrganizations.length > 0 && !activeOrganization) {
    return <OrganizationSetup onComplete={refreshOrganizations} />
  }

  // User is authenticated and has an active organization
  return <>{children}</>
}