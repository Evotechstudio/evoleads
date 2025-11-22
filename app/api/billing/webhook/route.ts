import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const SAFEPAY_WEBHOOK_SECRET = process.env.SAFEPAY_WEBHOOK_SECRET!
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-safepay-signature')

    // Verify webhook signature
    if (SAFEPAY_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', SAFEPAY_WEBHOOK_SECRET)
        .update(body)
        .digest('hex')

      if (signature !== expectedSignature) {
        console.error('Webhook signature verification failed')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    }

    const event = JSON.parse(body)
    console.log('Safepay webhook event:', event.event_type)

    // Handle different Safepay events
    switch (event.event_type) {
      case 'payment.succeeded':
      case 'order.completed':
        await handlePaymentSuccess(event.data)
        break
      
      case 'payment.failed':
      case 'order.failed':
        await handlePaymentFailed(event.data)
        break
      
      case 'subscription.created':
        await handleSubscriptionCreated(event.data)
        break
      
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data)
        break
      
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.data)
        break
      
      default:
        console.log(`Unhandled Safepay event type: ${event.event_type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Safepay webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(data: any) {
  const userId = data.metadata?.userId
  const planName = data.metadata?.planName || 'starter'
  
  if (!userId) {
    console.error('Missing userId in payment success:', data)
    return
  }

  try {
    // Update user plan in Supabase
    const { error: updateError } = await (supabase as any)
      .from('user_plans')
      .upsert({
        user_id: userId,
        plan_name: planName,
        search_requests_used: 0,
        leads_used: 0,
        subscription_id: data.subscription_id || data.order_id,
        safepay_customer_id: data.customer_id,
        subscription_status: 'active',
        payment_method: 'safepay',
        last_payment_date: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (updateError) {
      console.error('Error updating user plan:', updateError)
      return
    }

    console.log(`Payment successful for user ${userId} with plan ${planName}`)
  } catch (error) {
    console.error('Error in handlePaymentSuccess:', error)
  }
}

async function handlePaymentFailed(data: any) {
  const userId = data.metadata?.userId
  
  if (!userId) {
    console.error('Missing userId in payment failure:', data)
    return
  }

  try {
    // Update subscription status in Supabase
    const { error: updateError } = await (supabase as any)
      .from('user_plans')
      .update({
        subscription_status: 'payment_failed',
        last_payment_error: data.error_message || 'Payment failed',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating payment failure:', updateError)
      return
    }

    console.log(`Payment failed for user ${userId}`)
  } catch (error) {
    console.error('Error in handlePaymentFailed:', error)
  }
}

async function handleSubscriptionCreated(data: any) {
  const userId = data.metadata?.userId
  const planName = data.metadata?.planName || 'starter'
  
  if (!userId) {
    console.error('Missing userId in subscription creation:', data)
    return
  }

  try {
    const { error: updateError } = await (supabase as any)
      .from('user_plans')
      .upsert({
        user_id: userId,
        plan_name: planName,
        subscription_id: data.subscription_id,
        safepay_customer_id: data.customer_id,
        subscription_status: 'active',
        payment_method: 'safepay',
        current_period_end: data.current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (updateError) {
      console.error('Error creating subscription:', updateError)
      return
    }

    console.log(`Subscription created for user ${userId}`)
  } catch (error) {
    console.error('Error in handleSubscriptionCreated:', error)
  }
}

async function handleSubscriptionUpdated(data: any) {
  const userId = data.metadata?.userId
  
  if (!userId) {
    console.error('Missing userId in subscription update:', data)
    return
  }

  try {
    const { error: updateError } = await (supabase as any)
      .from('user_plans')
      .update({
        subscription_status: data.status || 'active',
        current_period_end: data.current_period_end,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating subscription:', updateError)
      return
    }

    console.log(`Subscription updated for user ${userId}`)
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error)
  }
}

async function handleSubscriptionCancelled(data: any) {
  const userId = data.metadata?.userId
  
  if (!userId) {
    console.error('Missing userId in subscription cancellation:', data)
    return
  }

  try {
    // Downgrade user to free plan
    const { error: updateError } = await (supabase as any)
      .from('user_plans')
      .update({
        plan_name: 'free',
        search_requests_used: 0,
        leads_used: 0,
        subscription_status: 'cancelled',
        subscription_id: null,
        payment_method: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error cancelling subscription:', updateError)
      return
    }

    console.log(`Subscription cancelled for user ${userId}, downgraded to free plan`)
  } catch (error) {
    console.error('Error in handleSubscriptionCancelled:', error)
  }
}
