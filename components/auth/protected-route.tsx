'use client'

import React from 'react'
import { useAuth } from '../../lib/auth/auth-context'
import { Loader2 } from 'lucide-react'
import { SignInForm } from './sign-in-form'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireProfile?: boolean
}

export function ProtectedRoute({ 
  children, 
  fallback,
  requireProfile = true 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show sign-in form if user is not authenticated
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        {fallback || <SignInForm />}
      </div>
    )
  }

  // Show loading if profile is required but not yet loaded
  if (requireProfile && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Setting up your profile...</p>
        </div>
      </div>
    )
  }

  // User is authenticated and profile is loaded (if required)
  return <>{children}</>
}