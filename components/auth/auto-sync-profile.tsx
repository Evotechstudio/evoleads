'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

export function AutoSyncProfile() {
  const { user, isLoaded } = useUser()
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    if (!isLoaded || !user || synced) return

    const syncProfile = async () => {
      try {
        const response = await fetch('/api/sync-user', {
          method: 'POST',
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Profile sync:', data.message)
          setSynced(true)
        }
      } catch (error) {
        console.error('Failed to sync profile:', error)
      }
    }

    syncProfile()
  }, [user, isLoaded, synced])

  return null
}
