'use client'

import React from 'react'
import { LeadManagement } from '../../../components/lead-generation'
import { useClerkAuth } from '../../../lib/auth/clerk-context'
import { Card, CardContent } from '../../../components/ui/card'
import { Building2 } from 'lucide-react'

export default function LeadsPage() {
  const { user, loading } = useClerkAuth()

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please sign in to access your leads.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
          <p className="text-muted-foreground">
            Manage and organize your generated leads
          </p>
        </div>
      </div>

      <LeadManagement organizationId={user.id} />
    </div>
  )
}