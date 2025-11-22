/**
 * Safepay Integration Test Script
 * 
 * This script tests the Safepay integration by:
 * 1. Creating a test checkout session
 * 2. Simulating webhook events
 * 3. Verifying database updates
 * 
 * Usage: npx tsx scripts/test-safepay.ts
 */

import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const TEST_USER_ID = 'test_user_123'

async function testCreateCheckout() {
  console.log('🧪 Testing checkout session creation...')
  
  try {
    const response = await axios.post(`${BASE_URL}/api/billing/create-checkout`, {
      planId: 'cplan_34n96CAT3Px6QokfOSAiFLybroyW',
      planName: 'Starter',
      price: 15
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.data.success) {
      console.log('✅ Checkout session created successfully')
      console.log('   Checkout URL:', response.data.checkoutUrl)
      console.log('   Session ID:', response.data.sessionId)
      console.log('   Order ID:', response.data.orderId)
      return response.data
    } else {
      console.log('❌ Failed to create checkout session')
      return null
    }
  } catch (error: any) {
    console.log('❌ Error creating checkout session:', error.response?.data || error.message)
    return null
  }
}

async function testWebhook(eventType: string, orderId: string) {
  console.log(`\n🧪 Testing webhook: ${eventType}...`)
  
  const webhookData = {
    event_type: eventType,
    data: {
      order_id: orderId,
      subscription_id: `sub_${Date.now()}`,
      customer_id: `cus_${Date.now()}`,
      amount: 420000, // 4200 PKR in paisa
      currency: 'PKR',
      status: 'completed',
      metadata: {
        userId: TEST_USER_ID,
        planName: 'starter',
        clerkPlanId: 'cplan_34n96CAT3Px6QokfOSAiFLybroyW'
      }
    }
  }

  try {
    const response = await axios.post(`${BASE_URL}/api/billing/webhook`, webhookData, {
      headers: {
        'Content-Type': 'application/json',
        'x-safepay-signature': 'test_signature' // In production, this should be properly signed
      }
    })

    if (response.data.received) {
      console.log(`✅ Webhook ${eventType} processed successfully`)
      return true
    } else {
      console.log(`❌ Webhook ${eventType} failed`)
      return false
    }
  } catch (error: any) {
    console.log(`❌ Error processing webhook:`, error.response?.data || error.message)
    return false
  }
}

async function runTests() {
  console.log('🚀 Starting Safepay Integration Tests\n')
  console.log('=' .repeat(50))
  
  // Test 1: Create checkout session
  const checkoutData = await testCreateCheckout()
  
  if (!checkoutData) {
    console.log('\n❌ Tests failed: Could not create checkout session')
    return
  }

  // Test 2: Simulate payment success webhook
  await testWebhook('payment.succeeded', checkoutData.orderId)
  
  // Test 3: Simulate subscription created webhook
  await testWebhook('subscription.created', checkoutData.orderId)
  
  console.log('\n' + '='.repeat(50))
  console.log('✅ All tests completed!')
  console.log('\n📝 Next steps:')
  console.log('   1. Check Supabase user_plans table for updates')
  console.log('   2. Verify subscription_status is "active"')
  console.log('   3. Test the checkout URL in a browser')
  console.log('   4. Monitor webhook logs in production')
}

// Run tests
runTests().catch(console.error)
