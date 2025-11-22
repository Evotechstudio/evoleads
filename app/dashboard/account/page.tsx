'use client'

import React from 'react'
import { DetailedUserProfile } from '../../../components/account/user-profile-detailed'
import { NotificationPreferences } from '../../../components/account/notification-preferences'
import { DataPrivacyControls } from '../../../components/account/data-privacy-controls'

export default function AccountPage() {

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile, preferences, and account data
        </p>
      </div>

      {/* User Profile */}
      <DetailedUserProfile 
        showUsageHistory={true}
        showAnalytics={false}
      />

      {/* Notification Preferences */}
      <NotificationPreferences />

      {/* Data Privacy Controls */}
      <DataPrivacyControls />
    </div>
  )
}