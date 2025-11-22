import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const SAFEPAY_BASE_URL = process.env.SAFEPAY_BASE_URL || 'https://sandbox.api.getsafepay.com'
const SAFEPAY_SECRET_KEY = process.env.SAFEPAY_SECRET_KEY

export async function GET(req: NextRequest) {
  try {
    // Test with minimal required fields for payment
    const testOrderData = {
      client: process.env.SAFEPAY_PUBLIC_KEY,
      environment: 'sandbox',
      intent: 'CYBERSOURCE',
      mode: 'payment',
      currency: 'PKR',
      amount: 100, // 1 PKR
      order_id: `test_${Date.now()}`,
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      source: 'custom'
    }

    console.log('Testing order creation with data:', JSON.stringify(testOrderData, null, 2))

    const response = await axios.post(
      `${SAFEPAY_BASE_URL}/order/v1/init`,
      testOrderData,
      {
        headers: {
          'Authorization': `Bearer ${SAFEPAY_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    )

    console.log('Safepay response:', JSON.stringify(response.data, null, 2))

    if (response.data && response.data.data) {
      const { token } = response.data.data
      const environment = 'sandbox'
      const checkoutUrl = `${SAFEPAY_BASE_URL}/checkout?tracker=${token}&env=${environment}`
      
      return NextResponse.json({
        success: true,
        message: 'Order created successfully',
        checkoutUrl: checkoutUrl,
        token: token,
        fullResponse: response.data
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid response structure',
      response: response.data
    })

  } catch (error: any) {
    console.error('Test checkout failed:', error.message)
    
    if (axios.isAxiosError(error)) {
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data
      })

      return NextResponse.json({
        success: false,
        error: error.message,
        status: error.response?.status,
        details: error.response?.data
      }, { status: error.response?.status || 500 })
    }

    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
