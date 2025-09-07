import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const redirect = searchParams.get('redirect') || '/dashboard'

    // REAL Google OAuth configuration
    const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gastrotools-bulletproof.vercel.app'
    const redirectUri = `${baseUrl}/api/auth/google/callback`
    
    console.log('🔐 Google OAuth Request:', {
      clientId: googleClientId ? 'Configured ✅' : 'Missing ❌',
      redirectUri,
      baseUrl,
      environment: process.env.NODE_ENV
    })
    
    // For development/staging without real OAuth credentials
    if (!googleClientId) {
      console.warn('⚠️ Google OAuth credentials missing - using development fallback')
      
      // Development fallback: simulate OAuth flow
      return NextResponse.redirect(`${baseUrl}/auth/oauth-dev?provider=google&email=google-user@gmail.com&redirect=${encodeURIComponent(redirect)}`)
    }

    // REAL Google OAuth URL
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    googleAuthUrl.searchParams.set('client_id', googleClientId)
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri)
    googleAuthUrl.searchParams.set('response_type', 'code')
    googleAuthUrl.searchParams.set('scope', 'openid email profile')
    googleAuthUrl.searchParams.set('state', JSON.stringify({ redirect, source: 'gastrotools' }))
    googleAuthUrl.searchParams.set('access_type', 'offline')
    googleAuthUrl.searchParams.set('prompt', 'consent')
    
    console.log('🚀 Redirecting to REAL Google OAuth')
    
    // Redirect to REAL Google OAuth
    return NextResponse.redirect(googleAuthUrl.toString())

  } catch (error) {
    console.error('Google OAuth redirect error:', error)
    return NextResponse.json(
      { error: 'OAuth redirect failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Handle Google OAuth callback
    const { code, state } = await request.json()
    
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code required' },
        { status: 400 }
      )
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.NEXT_PUBLIC_APP_URL + '/api/auth/google/callback'
      })
    })

    const tokens = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error('Token exchange failed')
    }

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    })

    const googleUser = await userResponse.json()

    if (!userResponse.ok) {
      throw new Error('User info fetch failed')
    }

    // Create or update user
    const user = {
      id: `google_${googleUser.id}`,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      provider: 'google',
      registeredAt: new Date().toISOString(),
      segment: detectSegmentFromEmail(googleUser.email)
    }

    // Generate auth token
    const jwt = require('jsonwebtoken')
    const authToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      success: true,
      user,
      authToken,
      needsOnboarding: true // Google users need profile completion
    })

  } catch (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.json(
      { error: 'OAuth authentication failed' },
      { status: 500 }
    )
  }
}

function detectSegmentFromEmail(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase()
  
  if (domain?.includes('schule') || domain?.includes('kita') || domain?.endsWith('.edu')) {
    return 'webmenue'
  }
  
  if (domain?.includes('senioren') || domain?.includes('pflege')) {
    return 'ear'
  }
  
  if (domain?.includes('restaurant') || domain?.includes('gastro') || domain?.includes('hotel')) {
    return 'kuechenmanager'
  }
  
  return 'general'
}