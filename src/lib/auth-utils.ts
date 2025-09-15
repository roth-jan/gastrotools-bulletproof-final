import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export interface User {
  id: string
  email: string
  name?: string
  plan?: string
}

export async function verifyAuth(request: NextRequest): Promise<User | null> {
  try {
    // Try to get token from Authorization header
    const authHeader = request.headers.get('authorization')
    let token: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      // Try to get token from cookies
      token = request.cookies.get('auth-token')?.value || null
    }

    if (!token) {
      return null
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'local-development-secret-key'
    ) as any

    return {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      plan: decoded.plan || 'free'
    }
  } catch (error) {
    console.error('Auth verification failed:', error)
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<User> {
  const user = await verifyAuth(request)
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan
    },
    process.env.JWT_SECRET || 'local-development-secret-key',
    { expiresIn: '7d' }
  )
}

export function isAdmin(user: User): boolean {
  return user.email === 'admin@gastrotools.de' || user.plan === 'admin'
}

export function canAccessAdminFeatures(user: User): boolean {
  return isAdmin(user) || user.plan === 'professional'
}

export function getDemoUsageTracking() {
  // Demo user always has usage available
  return {
    recipesCount: 5,
    speisekartenCount: 2,
    exportsCount: 3,
    inventoryCount: 50,
    lastReset: new Date()
  }
}