// Simple rate limiter
export const rateLimiter = {
  check: async (key: string) => {
    // Simple implementation - always allow for now
    return { success: true, remaining: 100 }
  }
}