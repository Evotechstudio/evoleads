import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Manual upgrade endpoint for testing
 * This bypasses Safepay and directly upgrades the user
 * USE ONLY FOR TESTING - Remove in production
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { planName = 'starter' } = body

    // Upgrade user plan directly in database
    const { error: updateError } = await supabase
      .from('user_plans')
      .upsert({
        user_id: userId,
        plan_name: planName,
        search_requests_used: 0,
        leads_used: 0,
        subscription_status: 'active',
        payment_method: 'manual_test',
        last_payment_date: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (updateError) {
      console.error('Error upgrading user:', updateError)
      return NextResponse.json({ error: 'Failed to upgrade user' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'User upgraded successfully (TEST MODE)',
      plan: planName,
      userId: userId
    })

  } catch (error) {
    console.error('Error in manual upgrade:', error)
    return NextResponse.json(
      { error: 'Failed to process upgrade' },
      { status: 500 }
    )
  }
}
