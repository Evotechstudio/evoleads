import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const SAFEPAY_BASE_URL = process.env.SAFEPAY_BASE_URL || 'https://sandbox.api.getsafepay.com'
const SAFEPAY_SECRET_KEY = process.env.SAFEPAY_SECRET_KEY

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tracker = searchParams.get('tracker')

  if (!tracker) {
    return NextResponse.json({ error: 'Tracker token required' }, { status: 400 })
  }

  try {
    // Try to get order details using the tracker
    const response = await axios.get(
      `${SAFEPAY_BASE_URL}/order/v1/track/${tracker}`,
      {
        headers: {
          'Authorization': `Bearer ${SAFEPAY_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return NextResponse.json({
      success: true,
      order: response.data
    })

  } catch (error: any) {
    console.error('Error verifying order:', error.message)
    
    if (axios.isAxiosError(error)) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error.response?.data
      }, { status: error.response?.status || 500 })
    }

    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
