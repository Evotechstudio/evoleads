import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user metadata from Clerk
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const metadata = user.publicMetadata as any
    
    // Calculate usage stats based on metadata
    const usageStats = {
      totalSearches: metadata?.trialRequests || 0,
      totalLeads: metadata?.leadsUsed || 0,
      lastSearchDate: metadata?.lastSearchDate || null,
      accountCreated: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
      currentPlan: metadata?.plan || 'trial',
      planLimits: {
        trial: {
          maxSearches: 2,
          maxLeads: 20
        },
        starter: {
          maxSearches: Infinity,
          maxLeads: 250
        },
        pro: {
          maxSearches: Infinity,
          maxLeads: 1000
        }
      }
    }
    
    return NextResponse.json(usageStats)

  } catch (error) {
    console.error('Error fetching usage stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    )
  }
}
