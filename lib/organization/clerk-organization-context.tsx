'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useClerkAuth } from '../auth/clerk-context'
import { 
  createOrganization as dbCreateOrganization,
  getUserOrganizations,
  getOrganization,
  addOrganizationMember,
  getOrganizationByInviteCode,
} from '../database'
import { syncClerkUserToSupabase } from '../auth/sync-user'
import type { Organization } from '../types'

interface ClerkOrganizationContextType {
  activeOrganization: Organization | null
  userOrganizations: Organization[]
  loading: boolean
  switchOrganization: (orgId: string) => Promise<void>
  createOrganization: (name: string) => Promise<Organization | null>
  joinOrganization: (inviteCode: string) => Promise<void>
  refreshOrganizations: () => Promise<void>
}

const ClerkOrganizationContext = createContext<ClerkOrganizationContextType | undefined>(undefined)

export function useClerkOrganization() {
  const context = useContext(ClerkOrganizationContext)
  if (context === undefined) {
    throw new Error('useClerkOrganization must be used within a ClerkOrganizationProvider')
  }
  return context
}

interface ClerkOrganizationProviderProps {
  children: React.ReactNode
}

export function ClerkOrganizationProvider({ children }: ClerkOrganizationProviderProps) {
  const { user, isSignedIn, loading: authLoading } = useClerkAuth()
  const [activeOrganization, setActiveOrganization] = useState<Organization | null>(null)
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUserOrganizations = async () => {
    if (!user?.id) return

    try {
      // First, sync the Clerk user to Supabase
      await syncClerkUserToSupabase(user)
      
      // Then fetch organizations
      const orgs = await getUserOrganizations(user.id)
      setUserOrganizations(orgs)
      
      // Set active organization (first one or previously selected)
      const storedOrgId = localStorage.getItem('activeOrganizationId')
      const activeOrg = storedOrgId 
        ? orgs.find(org => org.id === storedOrgId) || orgs[0]
        : orgs[0]
      
      setActiveOrganization(activeOrg || null)
      
      if (activeOrg) {
        localStorage.setItem('activeOrganizationId', activeOrg.id)
      }
    } catch (error) {
      console.error('Error fetching user organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const switchOrganization = async (orgId: string) => {
    const org = userOrganizations.find(o => o.id === orgId)
    if (org) {
      setActiveOrganization(org)
      localStorage.setItem('activeOrganizationId', orgId)
    }
  }

  const createOrganization = async (name: string): Promise<Organization | null> => {
    if (!user?.id) return null

    try {
      const newOrg = await dbCreateOrganization(name, user.id)
      if (newOrg) {
        // Add user as owner to organization_members
        await addOrganizationMember(newOrg.id, user.id, 'owner')
        
        // Refresh organizations
        await fetchUserOrganizations()
        
        // Switch to new organization
        await switchOrganization(newOrg.id)
      }
      return newOrg
    } catch (error) {
      console.error('Error creating organization:', error)
      return null
    }
  }

  const joinOrganization = async (inviteCode: string) => {
    if (!user?.id) return

    try {
      const org = await getOrganizationByInviteCode(inviteCode)
      if (!org) {
        throw new Error('Invalid invite code')
      }

      // Add user as member
      await addOrganizationMember(org.id, user.id, 'member')
      
      // Refresh organizations
      await fetchUserOrganizations()
      
      // Switch to joined organization
      await switchOrganization(org.id)
    } catch (error) {
      console.error('Error joining organization:', error)
      throw error
    }
  }

  const refreshOrganizations = async () => {
    setLoading(true)
    await fetchUserOrganizations()
  }

  useEffect(() => {
    if (!authLoading && isSignedIn && user) {
      fetchUserOrganizations()
    } else if (!authLoading && !isSignedIn) {
      setActiveOrganization(null)
      setUserOrganizations([])
      setLoading(false)
      localStorage.removeItem('activeOrganizationId')
    }
  }, [authLoading, isSignedIn, user])

  const value: ClerkOrganizationContextType = {
    activeOrganization,
    userOrganizations,
    loading: loading || authLoading,
    switchOrganization,
    createOrganization,
    joinOrganization,
    refreshOrganizations,
  }

  return (
    <ClerkOrganizationContext.Provider value={value}>
      {children}
    </ClerkOrganizationContext.Provider>
  )
}