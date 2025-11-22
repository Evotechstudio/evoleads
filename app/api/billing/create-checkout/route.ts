import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import axios from 'axios'

const SAFEPAY_BASE_URL = process.env.SAFEPAY_BASE_URL || 'https://sandbox.api.getsafepay.com'
const SAFEPAY_SECRET_KEY = process.env.SAFEPAY_SECRET_KEY

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { planId, planName, price } = body

    if (!planId || !planName || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: planId, planName, price' },
        { status: 400 }
      )
    }

    // Convert USD to PKR (approximate rate - you should use a real exchange rate API)
    const priceInPKR = Math.round(price * 280) // $1 ≈ 280 PKR

    // Create Safepay checkout session
    // Using minimal required fields that we know work from testing
    const checkoutData = {
      client: process.env.SAFEPAY_PUBLIC_KEY,
      environment: 'sandbox', // Hardcode for now to match test
      intent: 'CYBERSOURCE',
      mode: 'payment',
      currency: 'PKR',
      amount: priceInPKR * 100, // Safepay expects amount in paisa (smallest currency unit)
      order_id: `order_${Date.now()}_${userId}`,
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true&user_id=${userId}&plan=${planName}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      source: 'custom'
    }

    console.log('Creating Safepay checkout with URL:', `${SAFEPAY_BASE_URL}/order/v1/init`)
    console.log('Full checkout data:', JSON.stringify(checkoutData, null, 2))

    const response = await axios.post(
      `${SAFEPAY_BASE_URL}/order/v1/init`,
      checkoutData,
      {
        headers: {
          'Authorization': `Bearer ${SAFEPAY_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    )

    console.log('Safepay response:', JSON.stringify(response.data, null, 2))

    if (response.data && response.data.data) {
      const { token } = response.data.data
      
      // Construct checkout URL with environment parameter
      // Safepay requires both tracker and env parameters in the checkout URL
      const environment = process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
      const checkoutUrl = `${SAFEPAY_BASE_URL}/checkout?tracker=${token}&env=${environment}`
      
      console.log('Checkout URL:', checkoutUrl)
      
      return NextResponse.json({
        success: true,
        checkoutUrl: checkoutUrl,
        sessionId: token,
        orderId: checkoutData.order_id,
        trackingToken: token
      })
    } else {
      throw new Error('Invalid response from Safepay')
    }

  } catch (error) {
    console.error('Error creating Safepay checkout session:', error)
    
    if (axios.isAxiosError(error)) {
      console.error('Safepay API Error Details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      })
      
      // Check for network errors
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return NextResponse.json(
          { 
            error: `Cannot connect to Safepay API. Please check SAFEPAY_BASE_URL in environment variables.`,
            details: `Current URL: ${SAFEPAY_BASE_URL}`,
            suggestion: 'Verify the URL is correct: https://sandbox.api.getsafepay.com or https://api.getsafepay.com'
          },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { 
          error: `Safepay API Error: ${error.response?.data?.message || error.message}`,
          details: error.response?.data
        },
        { status: error.response?.status || 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
