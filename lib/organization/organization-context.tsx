'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../auth/auth-context'
import type { Database } from '../database.types'

type Organization = Database['public']['Tables']['organizations']['Row']
type OrganizationMember = Database['public']['Tables']['organization_members']['Row']

interface OrganizationWithRole extends Organization {
  role: 'owner' | 'admin' | 'member'
}

interface OrganizationContextType {
  activeOrganization: OrganizationWithRole | null
  userOrganizations: OrganizationWithRole[]
  loading: boolean
  error: string | null
  switchOrganization: (orgId: string) => Promise<void>
  createOrganization: (name: string) => Promise<Organization>
  joinOrganization: (inviteCode: string) => Promise<void>
  refreshOrganizations: () => Promise<void>
  clearError: () => void
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}

interface OrganizationProviderProps {
  children: React.ReactNode
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const { user, profile } = useAuth()
  const [activeOrganization, setActiveOrganization] = useState<OrganizationWithRole | null>(null)
  const [userOrganizations, setUserOrganizations] = useState<OrganizationWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const clearError = () => setError(null)

  const handleError = (error: unknown, message: string) => {
    console.error(message, error)
    setError(message)
  }

  const fetchUserOrganizations = async () => {
    if (!user) {
      setUserOrganizations([])
      setActiveOrganization(null)
      return
    }

    try {
      // Fetch organizations where user is a member
      const { data: memberships, error: membershipError } = await supabase
        .from('organization_members')
        .select(`
          role,
          organizations (
            id,
            name,
            owner_id,
            plan,
            credits,
            trial_searches_used,
            invite_code,
            created_at
          )
        `)
        .eq('user_id', user.id)

      if (membershipError) throw membershipError

      const orgsWithRoles: OrganizationWithRole[] = memberships
        .filter(membership => membership.organizations)
        .map(membership => ({
          ...(membership.organizations as Organization),
          role: membership.role
        }))

      setUserOrganizations(orgsWithRoles)

      // Set active organization from localStorage or first organization
      const savedActiveOrgId = localStorage.getItem('activeOrganizationId')
      let activeOrg = null

      if (savedActiveOrgId) {
        activeOrg = orgsWithRoles.find(org => org.id === savedActiveOrgId)
      }

      if (!activeOrg && orgsWithRoles.length > 0) {
        activeOrg = orgsWithRoles[0]
      }

      setActiveOrganization(activeOrg || null)

      if (activeOrg) {
        localStorage.setItem('activeOrganizationId', activeOrg.id)
      }
    } catch (error) {
      handleError(error, 'Failed to fetch organizations')
    }
  }

  const refreshOrganizations = async () => {
    setLoading(true)
    await fetchUserOrganizations()
    setLoading(false)
  }

  const switchOrganization = async (orgId: string) => {
    try {
      setError(null)
      const org = userOrganizations.find(o => o.id === orgId)
      if (!org) {
        throw new Error('Organization not found')
      }

      setActiveOrganization(org)
      localStorage.setItem('activeOrganizationId', orgId)
    } catch (error) {
      handleError(error, 'Failed to switch organization')
    }
  }

  const createOrganization = async (name: string): Promise<Organization> => {
    if (!user) {
      throw new Error('User must be authenticated to create organization')
    }

    try {
      setError(null)
      setLoading(true)

      // Create organization
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name,
          owner_id: user.id,
          plan: 'trial',
          credits: 0,
          trial_searches_used: 0,
        })
        .select()
        .single()

      if (orgError) throw orgError

      // Add user as owner in organization_members
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organization.id,
          user_id: user.id,
          role: 'owner',
        })

      if (memberError) throw memberError

      // Refresh organizations to include the new one
      await fetchUserOrganizations()

      return organization
    } catch (error) {
      handleError(error, 'Failed to create organization')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const joinOrganization = async (inviteCode: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to join organization')
    }

    try {
      setError(null)
      setLoading(true)

      // Find organization by invite code
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('invite_code', inviteCode)
        .single()

      if (orgError || !organization) {
        throw new Error('Invalid invite code')
      }

      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', organization.id)
        .eq('user_id', user.id)
        .single()

      if (memberCheckError && memberCheckError.code !== 'PGRST116') {
        throw memberCheckError
      }

      if (existingMember) {
        throw new Error('You are already a member of this organization')
      }

      // Add user as member
      const { error: joinError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organization.id,
          user_id: user.id,
          role: 'member',
        })

      if (joinError) throw joinError

      // Refresh organizations to include the new one
      await fetchUserOrganizations()
    } catch (error) {
      handleError(error, 'Failed to join organization')
      throw error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchUserOrganizations().finally(() => setLoading(false))
    } else {
      setUserOrganizations([])
      setActiveOrganization(null)
      setLoading(false)
    }
  }, [user])

  const value: OrganizationContextType = {
    activeOrganization,
    userOrganizations,
    loading,
    error,
    switchOrganization,
    createOrganization,
    joinOrganization,
    refreshOrganizations,
    clearError,
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}