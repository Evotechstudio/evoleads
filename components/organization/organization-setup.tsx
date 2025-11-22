'use client'

import React, { useState } from 'react'
import { useOrganization } from '../../lib/organization/organization-context'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'
import { Building2, Users, Plus } from 'lucide-react'

interface OrganizationSetupProps {
  onComplete: () => void
}

export function OrganizationSetup({ onComplete }: OrganizationSetupProps) {
  const { createOrganization, joinOrganization, loading, error, clearError } = useOrganization()
  const [mode, setMode] = useState<'create' | 'join' | null>(null)
  const [organizationName, setOrganizationName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organizationName.trim()) return

    try {
      setIsSubmitting(true)
      clearError()
      await createOrganization(organizationName.trim())
      onComplete()
    } catch (error) {
      // Error is handled by context
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode.trim()) return

    try {
      setIsSubmitting(true)
      clearError()
      await joinOrganization(inviteCode.trim())
      onComplete()
    } catch (error) {
      // Error is handled by context
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetMode = () => {
    setMode(null)
    setOrganizationName('')
    setInviteCode('')
    clearError()
  }

  if (mode === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Building2 className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Set up your organization
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Create a new organization or join an existing one to get started
            </p>
          </div>

          <div className="space-y-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setMode('create')}>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Create New Organization</CardTitle>
                <CardDescription>
                  Start fresh with your own organization and invite team members
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setMode('join')}>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Join Existing Organization</CardTitle>
                <CardDescription>
                  Use an invite code to join a team that's already set up
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Building2 className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Create Organization
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Give your organization a name to get started
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleCreateOrganization} className="space-y-4">
                <div>
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Enter organization name"
                    required
                    disabled={isSubmitting || loading}
                    className="mt-1"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetMode}
                    disabled={isSubmitting || loading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={!organizationName.trim() || isSubmitting || loading}
                    className="flex-1"
                  >
                    {isSubmitting || loading ? 'Creating...' : 'Create Organization'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (mode === 'join') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Users className="mx-auto h-12 w-12 text-green-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Join Organization
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter the invite code provided by your team
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleJoinOrganization} className="space-y-4">
                <div>
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <Input
                    id="inviteCode"
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Enter invite code"
                    required
                    disabled={isSubmitting || loading}
                    className="mt-1"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetMode}
                    disabled={isSubmitting || loading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={!inviteCode.trim() || isSubmitting || loading}
                    className="flex-1"
                  >
                    {isSubmitting || loading ? 'Joining...' : 'Join Organization'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}