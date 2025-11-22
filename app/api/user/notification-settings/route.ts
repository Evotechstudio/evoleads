import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

interface NotificationSettings {
  emailNotifications: boolean
  marketingEmails: boolean
  securityAlerts: boolean
  usageAlerts: boolean
  weeklyReports: boolean
  productUpdates: boolean
}

const defaultSettings: NotificationSettings = {
  emailNotifications: true,
  marketingEmails: false,
  securityAlerts: true,
  usageAlerts: true,
  weeklyReports: false,
  productUpdates: true
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { settings } = await req.json()
    
    // Get current user metadata
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const currentMetadata = user.publicMetadata || {}
    
    // Update notification settings in Clerk metadata
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...currentMetadata,
        notificationSettings: settings
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error updating notification settings:', error)
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get notification settings from Clerk metadata
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const settings = (user.publicMetadata as any)?.notificationSettings || defaultSettings
    
    return NextResponse.json({ 
      success: true, 
      settings 
    })

  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    )
  }
}
