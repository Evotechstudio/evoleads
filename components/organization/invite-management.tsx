'use client'

import React, { useState } from 'react'
import { useOrganization } from '../../lib/organization/organization-context'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Copy, Check, Users, Link, Share2 } from 'lucide-react'

export function InviteManagement() {
  const { activeOrganization } = useOrganization()
  const [copied, setCopied] = useState(false)

  if (!activeOrganization) {
    return null
  }

  const inviteUrl = `${window.location.origin}/join/${activeOrganization.invite_code}`

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(activeOrganization.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy invite code:', error)
    }
  }

  const copyInviteUrl = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy invite URL:', error)
    }
  }

  const shareInvite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${activeOrganization.name} on Evo Lead AI`,
          text: `You've been invited to join ${activeOrganization.name} on Evo Lead AI. Use this link to get started:`,
          url: inviteUrl,
        })
      } catch (error) {
        console.error('Failed to share invite:', error)
      }
    } else {
      // Fallback to copying URL
      copyInviteUrl()
    }
  }

  // Only show invite management for owners and admins
  if (activeOrganization.role !== 'owner' && activeOrganization.role !== 'admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Team Invites</span>
          </CardTitle>
          <CardDescription>
            Only organization owners and admins can manage team invites.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Invite Team Members</span>
        </CardTitle>
        <CardDescription>
          Share the invite code or link to add new members to {activeOrganization.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Invite Code Section */}
        <div className="space-y-2">
          <Label htmlFor="inviteCode">Invite Code</Label>
          <div className="flex space-x-2">
            <Input
              id="inviteCode"
              value={activeOrganization.invite_code}
              readOnly
              className="font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyInviteCode}
              className="flex-shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Team members can use this code when signing up to join your organization.
          </p>
        </div>

        {/* Invite URL Section */}
        <div className="space-y-2">
          <Label htmlFor="inviteUrl">Invite Link</Label>
          <div className="flex space-x-2">
            <Input
              id="inviteUrl"
              value={inviteUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyInviteUrl}
              className="flex-shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Link className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Share this direct link for easy access to join your organization.
          </p>
        </div>

        {/* Share Button */}
        <div className="flex space-x-2">
          <Button onClick={shareInvite} className="flex items-center space-x-2">
            <Share2 className="h-4 w-4" />
            <span>Share Invite</span>
          </Button>
        </div>

        {/* Organization Info */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Organization:</span>
            <span className="text-sm">{activeOrganization.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Plan:</span>
            <Badge variant="outline" className="text-xs">
              {activeOrganization.plan}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Your Role:</span>
            <Badge variant="default" className="text-xs">
              {activeOrganization.role}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}