import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const redirect = searchParams.get('redirect') || '/dashboard'

    // REAL Microsoft OAuth configuration  
    const microsoftClientId = process.env.MICROSOFT_CLIENT_ID || process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gastrotools-bulletproof.vercel.app'
    const redirectUri = `${baseUrl}/api/auth/microsoft/callback`
    
    console.log('🔐 Microsoft OAuth Request:', {
      clientId: microsoftClientId ? 'Configured ✅' : 'Missing ❌',
      redirectUri,
      baseUrl
    })
    
    // Development fallback if no real credentials
    if (!microsoftClientId) {
      console.warn('⚠️ Microsoft OAuth credentials missing - using development fallback')
      return NextResponse.redirect(`${baseUrl}/auth/oauth-dev?provider=microsoft&email=microsoft-user@outlook.com&redirect=${encodeURIComponent(redirect)}`)
    }

    // REAL Microsoft OAuth URL (Azure AD v2.0)
    const microsoftAuthUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize')
    microsoftAuthUrl.searchParams.set('client_id', microsoftClientId)
    microsoftAuthUrl.searchParams.set('redirect_uri', redirectUri)
    microsoftAuthUrl.searchParams.set('response_type', 'code')
    microsoftAuthUrl.searchParams.set('scope', 'openid email profile User.Read')
    microsoftAuthUrl.searchParams.set('state', JSON.stringify({ redirect, source: 'gastrotools' }))
    microsoftAuthUrl.searchParams.set('response_mode', 'query')
    
    console.log('🚀 Redirecting to REAL Microsoft OAuth')
    
    // Redirect to REAL Microsoft OAuth
    return NextResponse.redirect(microsoftAuthUrl.toString())

  } catch (error) {
    console.error('Microsoft OAuth redirect error:', error)
    return NextResponse.json(
      { error: 'Microsoft OAuth redirect failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}