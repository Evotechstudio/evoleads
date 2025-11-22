import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase'
import { 
  updateSearchStatus, 
  createLeads, 
  getOrganization,
  createUsageRecord 
} from '../../../../lib/database'
import { validateWebhookPayload } from '../../../../lib/lead-generation/validation'
import { createHash, timingSafeEqual } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature
    const signature = req.headers.get('x-webhook-signature')
    const timestamp = req.headers.get('x-webhook-timestamp')
    
    if (!signature || !timestamp) {
      return NextResponse.json(
        { error: 'Missing webhook signature or timestamp' },
        { status: 401 }
      )
    }

    const body = await req.text()
    
    // Verify the webhook is from a trusted source
    if (!verifyWebhookSignature(body, signature, timestamp)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    // Parse and validate the payload
    const payload = JSON.parse(body)
    const validationResult = validateWebhookPayload(payload)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid webhook payload', details: validationResult.errors },
        { status: 400 }
      )
    }

    const { search_id, status, leads, error_message } = validationResult.data!

    // Update search status
    const updatedSearch = await updateSearchStatus(search_id, status)
    
    if (!updatedSearch) {
      return NextResponse.json(
        { error: 'Search not found' },
        { status: 404 }
      )
    }

    // Handle different status updates
    switch (status) {
      case 'processing':
        await handleProcessingUpdate(updatedSearch)
        break
        
      case 'completed':
        if (leads && leads.length > 0) {
          await handleCompletedUpdate(updatedSearch, leads)
        }
        break
        
      case 'failed':
        await handleFailedUpdate(updatedSearch, error_message)
        break
    }

    // Send real-time update to client via Supabase realtime
    const supabase = createServerClient()
    await supabase
      .channel('lead_updates')
      .send({
        type: 'broadcast',
        event: 'search_update',
        payload: {
          search_id,
          status,
          organization_id: updatedSearch.organization_id,
          leads_count: leads?.length || 0
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

function verifyWebhookSignature(
  payload: string, 
  signature: string, 
  timestamp: string
): boolean {
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET
  
  if (!webhookSecret) {
    console.warn('N8N_WEBHOOK_SECRET not configured, skipping signature verification')
    return true // Allow in development
  }

  try {
    // Check timestamp to prevent replay attacks (5 minute window)
    const now = Math.floor(Date.now() / 1000)
    const webhookTime = parseInt(timestamp)
    
    if (Math.abs(now - webhookTime) > 300) {
      console.error('Webhook timestamp too old')
      return false
    }

    // Create expected signature
    const signaturePayload = `${timestamp}.${payload}`
    const expectedSignature = createHash('sha256')
      .update(signaturePayload)
      .update(webhookSecret)
      .digest('hex')
    
    const expectedBuffer = Buffer.from(`sha256=${expectedSignature}`, 'utf8')
    const actualBuffer = Buffer.from(signature, 'utf8')
    
    // Use timing-safe comparison
    return expectedBuffer.length === actualBuffer.length && 
           timingSafeEqual(expectedBuffer, actualBuffer)
           
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

async function handleProcessingUpdate(search: any) {
  // Log processing start
  console.log(`Search ${search.id} started processing`)
  
  // Could send notification to user here
  // await sendNotification(search.user_id, 'search_started', search)
}

async function handleCompletedUpdate(search: any, leads: any[]) {
  try {
    // Process and save leads
    const processedLeads = leads.map(lead => ({
      organization_id: search.organization_id,
      search_id: search.id,
      business_name: lead.business_name,
      email: lead.email || null,
      phone: lead.phone || null,
      website: lead.website || null,
      confidence_score: lead.confidence_score || null
    }))

    const savedLeads = await createLeads(processedLeads)
    
    // Create usage record
    await createUsageRecord({
      organization_id: search.organization_id,
      user_id: search.user_id,
      action_type: 'lead_generation_completed',
      credits_used: Math.ceil(leads.length / 100) // 1 credit per 100 leads
    })

    console.log(`Search ${search.id} completed with ${savedLeads.length} leads`)
    
  } catch (error) {
    console.error('Error handling completed update:', error)
    // Update search status to failed if lead saving fails
    await updateSearchStatus(search.id, 'failed')
  }
}

async function handleFailedUpdate(search: any, errorMessage?: string) {
  console.error(`Search ${search.id} failed:`, errorMessage)
  
  // Could send error notification to user here
  // await sendNotification(search.user_id, 'search_failed', { search, error: errorMessage })
}

// Rate limiting for webhook endpoints
const webhookRateLimit = new Map<string, { count: number; resetTime: number }>()

function checkWebhookRateLimit(identifier: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute window
  const maxRequests = 100 // Max 100 requests per minute
  
  const current = webhookRateLimit.get(identifier)
  
  if (!current || now > current.resetTime) {
    webhookRateLimit.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }
  
  if (current.count >= maxRequests) {
    return false
  }
  
  current.count++
  return true
}

// Health check endpoint for webhook monitoring
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'lead-updates-webhook'
  })
}
