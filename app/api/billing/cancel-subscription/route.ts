import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import axios from 'axios'

const SAFEPAY_BASE_URL = process.env.SAFEPAY_BASE_URL || 'https://sandbox.api.getsafepay.com'
const SAFEPAY_SECRET_KEY = process.env.SAFEPAY_SECRET_KEY

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user plan from Supabase to find subscription ID
    const { data: userPlan, error: fetchError } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (fetchError || !userPlan) {
      return NextResponse.json(
        { error: 'No user plan found' },
        { status: 404 }
      )
    }

    const subscriptionId = userPlan.subscription_id

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Cancel the subscription in Safepay
    try {
      const response = await axios.post(
        `${SAFEPAY_BASE_URL}/subscription/v1/cancel`,
        {
          subscription_id: subscriptionId,
          cancel_at_period_end: true
        },
        {
          headers: {
            'Authorization': `Bearer ${SAFEPAY_SECRET_KEY}`,
            'Content-Type': 'application/json',
            'X-SFPY-CLIENT-ID': process.env.SAFEPAY_PUBLIC_KEY || '',
            'X-SFPY-MERCHANT-ID': process.env.SAFEPAY_PUBLIC_KEY || ''
          }
        }
      )

      // Update user plan in Supabase
      await supabase
        .from('user_plans')
        .update({
          subscription_status: 'cancel_at_period_end',
          cancel_at_period_end: true,
          cancellation_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      return NextResponse.json({
        success: true,
        message: 'Subscription will be canceled at the end of the current billing period',
        cancelAt: userPlan.current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })

    } catch (safepayError) {
      // If Safepay API fails, still update local status
      console.error('Safepay cancellation failed, updating local status only:', safepayError)
      
      await supabase
        .from('user_plans')
        .update({
          subscription_status: 'cancel_requested',
          cancel_at_period_end: true,
          cancellation_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      return NextResponse.json({
        success: true,
        message: 'Cancellation request submitted. Your subscription will be canceled at the end of the current billing period.',
        cancelAt: userPlan.current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
