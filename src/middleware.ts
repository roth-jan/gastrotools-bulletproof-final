import { NextRequest, NextResponse } from 'next/server'
import { EnterpriseRateLimit, enterpriseRateLimits } from '@/lib/enterprise-rate-limiting'
import { EnterpriseMonitoring } from '@/lib/enterprise-monitoring'

export async function middleware(request: NextRequest) {
  const start = Date.now()
  
  try {
    // Get client identifier
    const ip = request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const userId = request.headers.get('x-user-id')
    
    // Determine rate limit type based on path
    let rateLimitConfig
    let identifier = ip
    
    if (request.nextUrl.pathname.startsWith('/api/auth/magic-link')) {
      rateLimitConfig = enterpriseRateLimits.magicLink
      identifier = request.nextUrl.searchParams.get('email') || ip
    } else if (request.nextUrl.pathname.startsWith('/api/auth/register')) {
      rateLimitConfig = enterpriseRateLimits.registration
    } else if (request.nextUrl.pathname.includes('/export') || request.nextUrl.pathname.includes('/download')) {
      rateLimitConfig = enterpriseRateLimits.businessExport
      identifier = userId || ip
    } else if (request.nextUrl.pathname.startsWith('/api/')) {
      rateLimitConfig = enterpriseRateLimits.api
    }
    
    // Apply rate limiting
    if (rateLimitConfig) {
      const rateResult = await EnterpriseRateLimit.checkRateLimit(identifier, rateLimitConfig)
      
      if (!rateResult.allowed) {
        // Log rate limit violation
        EnterpriseMonitoring.warn('rate_limit', 'Rate limit exceeded', {
          path: request.nextUrl.pathname,
          identifier,
          reason: rateResult.reason,
          blocked: rateResult.blocked,
          userAgent,
          ip
        }, userId || undefined)
        
        const response = NextResponse.json(
          { 
            error: rateResult.blocked ? 'Access blocked due to suspicious activity' : 'Rate limit exceeded',
            remaining: rateResult.remaining,
            resetTime: rateResult.resetTime,
            retryAfter: Math.ceil((rateResult.resetTime - Date.now()) / 1000)
          },
          { status: 429 }
        )
        
        // Add rate limit headers
        response.headers.set('X-RateLimit-Remaining', rateResult.remaining.toString())
        response.headers.set('X-RateLimit-Reset', rateResult.resetTime.toString())
        response.headers.set('Retry-After', Math.ceil((rateResult.resetTime - Date.now()) / 1000).toString())
        
        return response
      }
      
      // Add rate limit info to successful responses
      const response = NextResponse.next()
      response.headers.set('X-RateLimit-Remaining', rateResult.remaining.toString())
      response.headers.set('X-RateLimit-Reset', rateResult.resetTime.toString())
    }
    
    // Security headers
    const response = NextResponse.next()
    
    // ENTERPRISE: Security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    )
    
    // CSP for XSS protection
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.gastrotools.de"
    )
    
    // Track performance
    const duration = Date.now() - start
    if (duration > 1000) { // Log slow requests
      EnterpriseMonitoring.trackPerformance(
        `${request.method} ${request.nextUrl.pathname}`,
        duration,
        { ip, userAgent, userId }
      )
    }
    
    return response

  } catch (error) {
    // Log middleware errors
    EnterpriseMonitoring.error('middleware', 'Middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: request.nextUrl.pathname,
      ip: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent')
    })
    
    // Allow request to continue on middleware errors
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Apply to all API routes and specific pages
    '/api/:path*',
    '/auth/:path*',
    '/signup-light',
    '/register'
  ]
}