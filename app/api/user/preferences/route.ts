import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const preferences = await req.json()
    
    // Get current user metadata
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const currentMetadata = user.publicMetadata || {}
    
    // Update user preferences in Clerk metadata
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...currentMetadata,
        preferences
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error updating user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
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

    // Get user preferences from Clerk metadata
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const preferences = (user.publicMetadata as any)?.preferences || {
      emailNotifications: true,
      marketingEmails: false,
      dataProcessingConsent: true,
      analyticsConsent: true
    }
    
    return NextResponse.json({ 
      success: true, 
      preferences 
    })

  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}
