import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string // Custom key generator
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
}

interface RateLimitInfo {
  count: number
  resetTime: number
  remaining: number
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitInfo>()

export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: (req) => this.getClientIdentifier(req),
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config
    }
  }

  async checkLimit(req: NextRequest): Promise<{
    allowed: boolean
    limit: number
    remaining: number
    resetTime: number
    retryAfter?: number
  }> {
    const key = this.config.keyGenerator!(req)
    const now = Date.now()
    
    // Clean up expired entries periodically
    this.cleanup()
    
    let info = rateLimitStore.get(key)
    
    // Initialize or reset if window expired
    if (!info || now >= info.resetTime) {
      info = {
        count: 0,
        resetTime: now + this.config.windowMs,
        remaining: this.config.maxRequests
      }
    }
    
    // Check if limit exceeded
    if (info.count >= this.config.maxRequests) {
      return {
        allowed: false,
        limit: this.config.maxRequests,
        remaining: 0,
        resetTime: info.resetTime,
        retryAfter: Math.ceil((info.resetTime - now) / 1000)
      }
    }
    
    // Increment counter
    info.count++
    info.remaining = Math.max(0, this.config.maxRequests - info.count)
    
    // Update store
    rateLimitStore.set(key, info)
    
    return {
      allowed: true,
      limit: this.config.maxRequests,
      remaining: info.remaining,
      resetTime: info.resetTime
    }
  }

  private getClientIdentifier(req: NextRequest): string {
    // Try to get user ID from auth header or session
    const authHeader = req.headers.get('authorization')
    if (authHeader) {
      // Extract user ID from JWT or session token
      // This is a simplified version - implement proper token parsing
      const userId = this.extractUserIdFromAuth(authHeader)
      if (userId) return `user:${userId}`
    }
    
    // Fallback to IP address
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    return `ip:${ip}`
  }

  private extractUserIdFromAuth(authHeader: string): string | null {
    try {
      // This is a placeholder - implement actual JWT parsing
      // For Supabase, you'd decode the JWT token here
      if (authHeader.startsWith('Bearer ')) {
        // Parse JWT token and extract user ID
        // const token = authHeader.substring(7)
        // const decoded = jwt.decode(token)
        // return decoded?.sub || null
      }
      return null
    } catch {
      return null
    }
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, info] of rateLimitStore.entries()) {
      if (now >= info.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }
}

// Predefined rate limiters for different endpoints
export const leadGenerationLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 lead generation requests per minute
})

export const apiLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 API requests per 15 minutes
})

export const webhookLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 200, // 200 webhook requests per minute
})

// Utility function to create rate limit response headers
export function createRateLimitHeaders(result: {
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
}): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
  }
  
  if (result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString()
  }
  
  return headers
}

// Middleware function for Next.js API routes
export async function withRateLimit(
  req: NextRequest,
  limiter: RateLimiter
): Promise<Response | null> {
  const result = await limiter.checkLimit(req)
  
  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again in ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...createRateLimitHeaders(result)
        }
      }
    )
  }
  
  return null // No rate limit hit, continue processing
}

// Organization-specific rate limiting
export class OrganizationRateLimiter {
  private limiters = new Map<string, RateLimiter>()
  
  getLimiter(organizationId: string, plan: string): RateLimiter {
    const key = `${organizationId}:${plan}`
    
    if (!this.limiters.has(key)) {
      const config = this.getConfigForPlan(plan)
      this.limiters.set(key, new RateLimiter(config))
    }
    
    return this.limiters.get(key)!
  }
  
  private getConfigForPlan(plan: string): RateLimitConfig {
    const configs = {
      trial: {
        windowMs: 24 * 60 * 60 * 1000, // 24 hours
        maxRequests: 2, // 2 searches per day for trial
      },
      starter: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 5, // 5 searches per minute
      },
      growth: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10, // 10 searches per minute
      },
      agency: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 20, // 20 searches per minute
      }
    }
    
    return configs[plan as keyof typeof configs] || configs.trial
  }
}

export const organizationRateLimiter = new OrganizationRateLimiter()

// Usage tracking for analytics
export interface UsageMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  rateLimitedRequests: number
  averageResponseTime: number
}

class UsageTracker {
  private metrics = new Map<string, UsageMetrics>()
  
  track(key: string, success: boolean, responseTime: number, rateLimited: boolean = false) {
    const current = this.metrics.get(key) || {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rateLimitedRequests: 0,
      averageResponseTime: 0
    }
    
    current.totalRequests++
    
    if (rateLimited) {
      current.rateLimitedRequests++
    } else if (success) {
      current.successfulRequests++
    } else {
      current.failedRequests++
    }
    
    // Update average response time
    current.averageResponseTime = 
      (current.averageResponseTime * (current.totalRequests - 1) + responseTime) / current.totalRequests
    
    this.metrics.set(key, current)
  }
  
  getMetrics(key: string): UsageMetrics | null {
    return this.metrics.get(key) || null
  }
  
  getAllMetrics(): Map<string, UsageMetrics> {
    return new Map(this.metrics)
  }
}

export const usageTracker = new UsageTracker()