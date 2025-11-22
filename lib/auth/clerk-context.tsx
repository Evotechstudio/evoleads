'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import type { UserResource } from '@clerk/types'

// Plan types based on Clerk metadata
export type PlanType = 'trial' | 'starter' | 'pro'

export interface UserMetadata extends Record<string, any> {
  plan: PlanType
  leadsUsed: number
  trialRequests: number
  trialEndsAt?: string
}

interface ClerkAuthContextType {
  user: UserResource | null
  metadata: UserMetadata | null
  loading: boolean
  isSignedIn: boolean
  signOut: () => Promise<void>
  updateMetadata: (updates: Partial<UserMetadata>) => Promise<void>
  canMakeRequest: boolean
  remainingLeads: number
  remainingRequests: number
}

const ClerkAuthContext = createContext<ClerkAuthContextType | undefined>(undefined)

export function useClerkAuth() {
  const context = useContext(ClerkAuthContext)
  if (context === undefined) {
    throw new Error('useClerkAuth must be used within a ClerkAuthProvider')
  }
  return context
}

interface ClerkAuthProviderProps {
  children: React.ReactNode
}

export function ClerkAuthProvider({ children }: ClerkAuthProviderProps) {
  const { user, isSignedIn, isLoaded } = useUser()
  const { signOut: clerkSignOut } = useClerk()
  const [metadata, setMetadata] = useState<UserMetadata | null>(null)

  // Initialize user metadata on first sign-in
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const publicMetadata = user.publicMetadata as any
      
      // Set default metadata if not exists
      if (!publicMetadata?.plan) {
        const defaultMetadata: UserMetadata = {
          plan: 'trial',
          leadsUsed: 0,
          trialRequests: 0,
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        }
        
        // Initialize metadata via API
        fetch('/api/user/metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(defaultMetadata),
        }).then(() => {
          setMetadata(defaultMetadata)
        }).catch(console.error)
      } else {
        setMetadata(publicMetadata as UserMetadata)
      }
    } else if (isLoaded && !isSignedIn) {
      setMetadata(null)
    }
  }, [isLoaded, isSignedIn, user])

  const updateMetadata = async (updates: Partial<UserMetadata>) => {
    if (!user) return

    const newMetadata = { ...metadata, ...updates } as UserMetadata
    
    // Update metadata via API call instead of user.update
    try {
      const response = await fetch('/api/user/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMetadata),
      })
      
      if (response.ok) {
        setMetadata(newMetadata)
        await user.reload()
      }
    } catch (error) {
      console.error('Error updating metadata:', error)
    }
  }

  const signOut = async () => {
    await clerkSignOut()
    setMetadata(null)
  }

  // Calculate usage limits
  const canMakeRequest = React.useMemo(() => {
    if (!metadata) return false
    
    switch (metadata.plan) {
      case 'trial':
        return metadata.trialRequests < 2
      case 'starter':
        return metadata.leadsUsed < 250
      case 'pro':
        return false // Coming soon
      default:
        return false
    }
  }, [metadata])

  const remainingLeads = React.useMemo(() => {
    if (!metadata) return 0
    
    switch (metadata.plan) {
      case 'trial':
        return Math.max(0, 20 - metadata.leadsUsed)
      case 'starter':
        return Math.max(0, 250 - metadata.leadsUsed)
      case 'pro':
        return 0 // Coming soon
      default:
        return 0
    }
  }, [metadata])

  const remainingRequests = React.useMemo(() => {
    if (!metadata) return 0
    
    switch (metadata.plan) {
      case 'trial':
        return Math.max(0, 2 - metadata.trialRequests)
      case 'starter':
        return Infinity // Unlimited requests
      case 'pro':
        return 0 // Coming soon
      default:
        return 0
    }
  }, [metadata])

  const value: ClerkAuthContextType = {
    user: user || null,
    metadata,
    loading: !isLoaded,
    isSignedIn: !!isSignedIn,
    signOut,
    updateMetadata,
    canMakeRequest,
    remainingLeads,
    remainingRequests,
  }

  return (
    <ClerkAuthContext.Provider value={value}>
      {children}
    </ClerkAuthContext.Provider>
  )
}