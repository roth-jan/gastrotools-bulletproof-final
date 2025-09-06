// ENTERPRISE: Advanced Rate-Limiting with Redis-like functionality

interface RateLimitEntry {
  count: number
  resetTime: number
  firstRequest: number
  userAgent?: string
  blocked: boolean
}

export class EnterpriseRateLimit {
  private static storage = new Map<string, RateLimitEntry>()
  private static suspiciousIPs = new Set<string>()
  
  static async checkRateLimit(
    identifier: string,
    config: {
      windowMs: number
      maxRequests: number
      blockDurationMs?: number
      suspiciousThreshold?: number
    }
  ): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
    blocked: boolean
    reason?: string
  }> {
    const now = Date.now()
    const key = `rl:${identifier}`
    
    // Clean expired entries
    this.cleanExpiredEntries(now)
    
    // Check if IP is blocked for suspicious activity
    if (this.suspiciousIPs.has(identifier)) {
      const blockUntil = this.storage.get(`block:${identifier}`)?.resetTime || 0
      if (now < blockUntil) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: blockUntil,
          blocked: true,
          reason: 'blocked_suspicious_activity'
        }
      } else {
        // Unblock after cooldown
        this.suspiciousIPs.delete(identifier)
        this.storage.delete(`block:${identifier}`)
      }
    }
    
    const current = this.storage.get(key)
    
    if (!current || now > current.resetTime) {
      // New window
      this.storage.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
        firstRequest: now,
        blocked: false
      })
      
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs,
        blocked: false
      }
    }
    
    // Check for suspicious patterns
    if (config.suspiciousThreshold && current.count >= config.suspiciousThreshold) {
      const requestRate = current.count / ((now - current.firstRequest) / 1000) // requests per second
      
      if (requestRate > 2) { // More than 2 requests per second = suspicious
        this.suspiciousIPs.add(identifier)
        this.storage.set(`block:${identifier}`, {
          count: 0,
          resetTime: now + (config.blockDurationMs || 3600000), // 1h default block
          firstRequest: now,
          blocked: true
        })
        
        console.warn('🚨 Suspicious activity detected:', {
          identifier,
          requestRate,
          totalRequests: current.count,
          timeWindow: (now - current.firstRequest) / 1000
        })
        
        return {
          allowed: false,
          remaining: 0,
          resetTime: now + (config.blockDurationMs || 3600000),
          blocked: true,
          reason: 'suspicious_activity_detected'
        }
      }
    }
    
    // Normal rate limiting
    if (current.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
        blocked: false,
        reason: 'rate_limit_exceeded'
      }
    }
    
    // Increment counter
    current.count++
    this.storage.set(key, current)
    
    return {
      allowed: true,
      remaining: config.maxRequests - current.count,
      resetTime: current.resetTime,
      blocked: false
    }
  }
  
  private static cleanExpiredEntries(now: number) {
    // Clean every 1000 checks to prevent memory issues
    if (Math.random() < 0.001) {
      for (const [key, entry] of this.storage.entries()) {
        if (now > entry.resetTime) {
          this.storage.delete(key)
        }
      }
    }
  }
  
  static getStats(): {
    totalEntries: number
    blockedIPs: number
    memoryUsage: string
  } {
    return {
      totalEntries: this.storage.size,
      blockedIPs: this.suspiciousIPs.size,
      memoryUsage: `${Math.round(JSON.stringify([...this.storage]).length / 1024)}KB`
    }
  }
}

// ENTERPRISE: Rate limit configurations
export const enterpriseRateLimits = {
  // User actions
  pdfExport: { 
    windowMs: 60000, // 1 minute
    maxRequests: 10, // 10 PDFs per minute per user
    suspiciousThreshold: 20,
    blockDurationMs: 3600000 // 1h block for abuse
  },
  
  // Authentication  
  magicLink: {
    windowMs: 300000, // 5 minutes
    maxRequests: 3, // 3 magic links per 5min per email
    blockDurationMs: 1800000 // 30min block
  },
  
  registration: {
    windowMs: 3600000, // 1 hour  
    maxRequests: 5, // 5 registrations per hour per IP
    suspiciousThreshold: 10,
    blockDurationMs: 7200000 // 2h block
  },
  
  // API endpoints
  api: {
    windowMs: 60000, // 1 minute
    maxRequests: 120, // 120 API calls per minute per IP
    suspiciousThreshold: 200,
    blockDurationMs: 900000 // 15min block
  },
  
  // Export actions (business critical)
  businessExport: {
    windowMs: 86400000, // 24 hours
    maxRequests: 100, // 100 exports per day per user
    suspiciousThreshold: 200,
    blockDurationMs: 86400000 // 24h block for mass export abuse
  }
}