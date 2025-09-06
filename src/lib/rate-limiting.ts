import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiting (for production: use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  identifier: 'ip' | 'user' | 'email'
}

export class RateLimit {
  static check(request: NextRequest, config: RateLimitConfig): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    
    // Get identifier
    let key: string
    switch (config.identifier) {
      case 'ip':
        key = request.headers.get('x-forwarded-for') || 'unknown-ip'
        break
      case 'user':
        const userId = request.headers.get('x-user-id') || 'anonymous'
        key = `user:${userId}`
        break
      case 'email':
        const email = request.headers.get('x-user-email') || 'anonymous'
        key = `email:${email}`
        break
      default:
        key = 'global'
    }
    
    // Clean old entries
    for (const [k, data] of rateLimitMap.entries()) {
      if (now > data.resetTime) {
        rateLimitMap.delete(k)
      }
    }
    
    // Get current data
    const current = rateLimitMap.get(key)
    
    if (!current || now > current.resetTime) {
      // New window
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs
      }
    }
    
    // Check limit
    if (current.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime
      }
    }
    
    // Increment counter
    current.count++
    rateLimitMap.set(key, current)
    
    return {
      allowed: true,
      remaining: config.maxRequests - current.count,
      resetTime: current.resetTime
    }
  }
}

// Rate limit configurations
export const rateLimits = {
  pdfExport: { windowMs: 60000, maxRequests: 5, identifier: 'email' as const }, // 5 PDFs per minute per user
  registration: { windowMs: 3600000, maxRequests: 3, identifier: 'ip' as const }, // 3 registrations per hour per IP
  magicLink: { windowMs: 300000, maxRequests: 2, identifier: 'email' as const }, // 2 magic links per 5min per email
  api: { windowMs: 60000, maxRequests: 60, identifier: 'ip' as const } // 60 API calls per minute per IP
}

export async function POST(request: NextRequest) {
  try {
    const { action, identifier } = await request.json()
    
    if (!rateLimits[action as keyof typeof rateLimits]) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    
    const config = rateLimits[action as keyof typeof rateLimits]
    const result = RateLimit.check(request, config)
    
    return NextResponse.json({
      allowed: result.allowed,
      remaining: result.remaining,
      resetTime: result.resetTime,
      action
    })
    
  } catch (error) {
    console.error('Rate limit check error:', error)
    return NextResponse.json({ error: 'Rate limit check failed' }, { status: 500 })
  }
}