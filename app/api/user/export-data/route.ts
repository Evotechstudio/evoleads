import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data from Clerk
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    
    // Prepare user data export
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        fullName: user.fullName,
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
        imageUrl: user.imageUrl
      },
      metadata: user.publicMetadata,
      preferences: (user.publicMetadata as any)?.preferences || {},
      usage: {
        plan: (user.publicMetadata as any)?.plan || 'trial',
        leadsUsed: (user.publicMetadata as any)?.leadsUsed || 0,
        trialRequests: (user.publicMetadata as any)?.trialRequests || 0,
        trialEndsAt: (user.publicMetadata as any)?.trialEndsAt
      },
      // Note: In a real implementation, you would also export:
      // - Search history from database
      // - Generated leads from database
      // - Billing history from database
      // Since we're using Clerk instead of Supabase, this is a simplified version
      searches: [],
      leads: [],
      billingHistory: [],
      dataProcessingLog: {
        consentGiven: (user.publicMetadata as any)?.preferences?.dataProcessingConsent || true,
        analyticsConsent: (user.publicMetadata as any)?.preferences?.analyticsConsent || true,
        lastUpdated: new Date().toISOString()
      }
    }

    // Create JSON response with proper headers for download
    const jsonData = JSON.stringify(exportData, null, 2)
    
    return new NextResponse(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="evo-lead-ai-data-${new Date().toISOString().split('T')[0]}.json"`,
        'Content-Length': jsonData.length.toString()
      }
    })

  } catch (error) {
    console.error('Error exporting user data:', error)
    return NextResponse.json(
      { error: 'Failed to export user data' },
      { status: 500 }
    )
  }
}
