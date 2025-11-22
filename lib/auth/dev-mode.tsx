'use client'

import React, { createContext, useContext, useState } from 'react'
import type { UserResource } from '@clerk/types'

// Development mode auth context for testing without Clerk
interface DevAuthContextType {
  user: Partial<UserResource> | null
  metadata: any
  loading: boolean
  isSignedIn: boolean
  signOut: () => Promise<void>
  updateMetadata: (updates: any) => Promise<void>
  canMakeRequest: boolean
  remainingLeads: number
  remainingRequests: number
}

const DevAuthContext = createContext<DevAuthContextType | undefined>(undefined)

export function useDevAuth() {
  const context = useContext(DevAuthContext)
  if (context === undefined) {
    throw new Error('useDevAuth must be used within a DevAuthProvider')
  }
  return context
}

interface DevAuthProviderProps {
  children: React.ReactNode
}

export function DevAuthProvider({ children }: DevAuthProviderProps) {
  const [isSignedIn, setIsSignedIn] = useState(true) // Auto sign-in for dev
  const [metadata, setMetadata] = useState({
    plan: 'trial',
    leadsUsed: 5,
    trialRequests: 0,
    trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  })

  const mockUser: Partial<UserResource> = {
    id: 'dev_user_123',
    firstName: 'Dev',
    lastName: 'User',
    emailAddresses: [{ emailAddress: 'dev@example.com' } as any],
    publicMetadata: metadata,
  }

  const signOut = async () => {
    setIsSignedIn(false)
  }

  const updateMetadata = async (updates: any) => {
    const newMetadata = { ...metadata, ...updates }
    setMetadata(newMetadata)
  }

  const canMakeRequest = metadata.plan === 'trial' ? metadata.trialRequests < 2 : metadata.leadsUsed < 250
  const remainingLeads = metadata.plan === 'trial' ? Math.max(0, 20 - metadata.leadsUsed) : Math.max(0, 250 - metadata.leadsUsed)
  const remainingRequests = metadata.plan === 'trial' ? Math.max(0, 2 - metadata.trialRequests) : Infinity

  const value: DevAuthContextType = {
    user: isSignedIn ? mockUser : null,
    metadata: isSignedIn ? metadata : null,
    loading: false,
    isSignedIn,
    signOut,
    updateMetadata,
    canMakeRequest,
    remainingLeads,
    remainingRequests,
  }

  return (
    <DevAuthContext.Provider value={value}>
      {children}
    </DevAuthContext.Provider>
  )
}