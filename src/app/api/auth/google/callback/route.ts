import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    
    console.log('🔐 Google OAuth Callback:', {
      code: code ? 'Received ✅' : 'Missing ❌',
      state,
      error
    })
    
    // Handle OAuth errors (user denial, etc.)
    if (error) {
      console.warn('❌ Google OAuth Error:', error)
      return NextResponse.redirect('/signup-light?oauth_error=' + encodeURIComponent(error))
    }
    
    if (!code) {
      console.error('❌ No authorization code received')
      return NextResponse.redirect('/signup-light?oauth_error=no_code')
    }
    
    // Exchange authorization code for tokens
    const tokenResponse = await exchangeCodeForTokens(code)
    
    if (!tokenResponse.success) {
      console.error('❌ Token exchange failed:', tokenResponse.error)
      return NextResponse.redirect('/signup-light?oauth_error=token_exchange_failed')
    }
    
    // Get user info from Google
    const userInfo = await getGoogleUserInfo(tokenResponse.tokens.access_token)
    
    if (!userInfo.success) {
      console.error('❌ User info fetch failed:', userInfo.error)
      return NextResponse.redirect('/signup-light?oauth_error=user_info_failed')
    }
    
    // Create or get existing user
    const user = await createOrGetGoogleUser(userInfo.data)
    
    // Generate JWT for app session
    const appToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        provider: 'google',
        verified: true
      },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    )
    
    // Determine redirect based on state or default
    let redirectUrl = '/dashboard'
    if (state) {
      try {
        const stateData = JSON.parse(state)
        redirectUrl = stateData.redirect || '/dashboard'
      } catch (e) {
        redirectUrl = state || '/dashboard'
      }
    }
    
    console.log('✅ Google OAuth Success:', {
      userId: user.id,
      email: user.email,
      redirect: redirectUrl
    })
    
    // Set auth cookie and redirect
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set('auth-token', appToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    
    return response

  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect('/signup-light?oauth_error=callback_failed')
  }
}

async function exchangeCodeForTokens(code: string) {
  try {
    const tokenUrl = 'https://oauth2.googleapis.com/token'
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gastrotools-bulletproof.vercel.app'}/api/auth/google/callback`
    
    if (!clientSecret) {
      return { success: false, error: 'Client secret not configured' }
    }
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      return { success: false, error: `Token exchange failed: ${response.status} ${errorText}` }
    }
    
    const tokens = await response.json()
    return { success: true, tokens }
    
  } catch (error) {
    return { success: false, error: `Token exchange error: ${error instanceof Error ? error.message : 'Unknown'}` }
  }
}

async function getGoogleUserInfo(accessToken: string) {
  try {
    const userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo'
    const response = await fetch(userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!response.ok) {
      return { success: false, error: `User info fetch failed: ${response.status}` }
    }
    
    const userData = await response.json()
    return { success: true, data: userData }
    
  } catch (error) {
    return { success: false, error: `User info error: ${error instanceof Error ? error.message : 'Unknown'}` }
  }
}

async function createOrGetGoogleUser(googleUserData: any) {
  // Auto-detect segment from email
  const segment = detectSegmentFromEmail(googleUserData.email)
  
  const user = {
    id: `google_${googleUserData.id}`,
    email: googleUserData.email,
    name: googleUserData.name,
    picture: googleUserData.picture,
    provider: 'google',
    segment,
    registeredAt: new Date().toISOString(),
    verified: true,
    company: '', // Will be filled during onboarding
    role: '',
    orgType: ''
  }
  
  // TODO: Save to database or check for existing user
  console.log('👤 Google User Created/Retrieved:', {
    id: user.id,
    email: user.email,
    name: user.name,
    segment
  })
  
  return user
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