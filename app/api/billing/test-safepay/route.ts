import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(req: NextRequest) {
  const SAFEPAY_BASE_URL = process.env.SAFEPAY_BASE_URL || 'https://sandbox.api.getsafepay.com'
  const SAFEPAY_SECRET_KEY = process.env.SAFEPAY_SECRET_KEY

  try {
    console.log('Testing Safepay API...')
    console.log('Base URL:', SAFEPAY_BASE_URL)
    console.log('API Key exists:', !!SAFEPAY_SECRET_KEY)
    console.log('API Key (first 10 chars):', SAFEPAY_SECRET_KEY?.substring(0, 10))

    // Test with a minimal order creation request
    // Based on Safepay docs, client and environment should be in the body
    const testOrderData = {
      client: process.env.SAFEPAY_PUBLIC_KEY,
      environment: 'sandbox', // or 'production'
      intent: 'CYBERSOURCE',
      mode: 'payment',
      currency: 'PKR',
      amount: 100, // 1 PKR in paisa
      order_id: `test_order_${Date.now()}`,
      source: 'custom'
    }

    console.log('Test order data:', {
      ...testOrderData,
      client: testOrderData.client?.substring(0, 10) + '...'
    })

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

    return NextResponse.json({
      success: true,
      message: 'Safepay API is working correctly',
      baseUrl: SAFEPAY_BASE_URL,
      endpoint: '/order/v1/init',
      response: response.data,
      status: response.status
    })

  } catch (error: any) {
    console.error('Safepay test failed:', error.message)
    
    if (axios.isAxiosError(error)) {
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      })

      return NextResponse.json({
        success: false,
        error: error.message,
        baseUrl: SAFEPAY_BASE_URL,
        endpoint: '/order/v1/init',
        status: error.response?.status,
        details: error.response?.data || 'No response data',
        code: error.code,
        suggestion: error.response?.status === 401 
          ? 'Check your SAFEPAY_SECRET_KEY - it may be invalid or expired'
          : error.response?.status === 400
          ? 'Check the request payload format'
          : 'Check Safepay API documentation'
      }, { status: error.response?.status || 500 })
    }

    return NextResponse.json({
      success: false,
      error: error.message,
      baseUrl: SAFEPAY_BASE_URL
    }, { status: 500 })
  }
}
