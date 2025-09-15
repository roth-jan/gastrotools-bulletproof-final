import { NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

// Simple in-memory rate limiter (in production use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function createRateLimit(config: RateLimitConfig) {
  return (identifier: string): { allowed: boolean; remaining: number; resetTime: number } => {
    const now = Date.now()
    const key = identifier
    const window = config.windowMs
    const limit = config.maxRequests

    const current = requestCounts.get(key)

    if (!current || now > current.resetTime) {
      // New window or expired window
      const resetTime = now + window
      requestCounts.set(key, { count: 1, resetTime })
      return { allowed: true, remaining: limit - 1, resetTime }
    }

    if (current.count >= limit) {
      return { allowed: false, remaining: 0, resetTime: current.resetTime }
    }

    current.count++
    requestCounts.set(key, current)
    return { allowed: true, remaining: limit - current.count, resetTime: current.resetTime }
  }
}

export const leadCaptureLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5
})

export const apiLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100
})

export function addRateLimitHeaders(
  response: NextResponse,
  result: { remaining: number; resetTime: number }
): NextResponse {
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString())
  return response
}