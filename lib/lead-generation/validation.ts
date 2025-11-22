import { z } from 'zod'

// Validation schema for search requests
const searchRequestSchema = z.object({
  business_type: z.string().min(1, 'Business type is required').max(100, 'Business type too long'),
  country: z.string().min(1, 'Country is required').max(50, 'Country name too long'),
  state: z.string().min(1, 'State/Province is required').max(50, 'State name too long'),
  city: z.string().min(1, 'City is required').max(50, 'City name too long'),
  leads_requested: z.number().int().min(1).max(500, 'Maximum 500 leads per request'),
  organization_id: z.string().uuid('Invalid organization ID format')
})

export type ValidatedSearchRequest = z.infer<typeof searchRequestSchema>

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: string[]
}

export function validateSearchRequest(data: any): ValidationResult<ValidatedSearchRequest> {
  try {
    const validatedData = searchRequestSchema.parse(data)
    return {
      success: true,
      data: validatedData
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`)
      }
    }
    
    return {
      success: false,
      errors: ['Invalid request format']
    }
  }
}

// Validation for webhook payloads
const webhookPayloadSchema = z.object({
  search_id: z.string().uuid(),
  status: z.enum(['processing', 'completed', 'failed']),
  leads: z.array(z.object({
    business_name: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    website: z.string().url().optional(),
    confidence_score: z.number().min(0).max(100).optional()
  })).optional(),
  error_message: z.string().optional()
})

export type ValidatedWebhookPayload = z.infer<typeof webhookPayloadSchema>

export function validateWebhookPayload(data: any): ValidationResult<ValidatedWebhookPayload> {
  try {
    const validatedData = webhookPayloadSchema.parse(data)
    return {
      success: true,
      data: validatedData
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`)
      }
    }
    
    return {
      success: false,
      errors: ['Invalid webhook payload format']
    }
  }
}

// Rate limiting validation
export function validateRateLimit(
  requestCount: number, 
  timeWindow: number, 
  maxRequests: number
): ValidationResult<boolean> {
  if (requestCount >= maxRequests) {
    return {
      success: false,
      errors: [`Rate limit exceeded. Maximum ${maxRequests} requests per ${timeWindow} seconds allowed.`]
    }
  }
  
  return {
    success: true,
    data: true
  }
}

// Organization access validation
export function validateOrganizationAccess(
  userRole: string,
  requiredRole: string = 'member'
): ValidationResult<boolean> {
  const roleHierarchy = {
    'member': 1,
    'admin': 2,
    'owner': 3
  }
  
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0
  
  if (userLevel < requiredLevel) {
    return {
      success: false,
      errors: [`Insufficient permissions. Required role: ${requiredRole}, current role: ${userRole}`]
    }
  }
  
  return {
    success: true,
    data: true
  }
}

// Credit validation
export function validateCreditsAvailable(
  availableCredits: number,
  requiredCredits: number
): ValidationResult<boolean> {
  if (availableCredits < requiredCredits) {
    return {
      success: false,
      errors: [`Insufficient credits. Required: ${requiredCredits}, Available: ${availableCredits}`]
    }
  }
  
  return {
    success: true,
    data: true
  }
}

// Trial usage validation
export function validateTrialUsage(
  trialSearchesUsed: number,
  maxTrialSearches: number = 2
): ValidationResult<boolean> {
  if (trialSearchesUsed >= maxTrialSearches) {
    return {
      success: false,
      errors: [`Trial limit reached. Used ${trialSearchesUsed}/${maxTrialSearches} free searches.`]
    }
  }
  
  return {
    success: true,
    data: true
  }
}