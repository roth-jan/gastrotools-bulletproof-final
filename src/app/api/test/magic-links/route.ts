import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for staging magic links
const magicLinkStorage = new Map<string, {
  token: string
  email: string
  createdAt: number
  used: boolean
  expiresAt: number
}>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      // Return all recent magic links for staging overview
      const recentLinks = Array.from(magicLinkStorage.entries())
        .filter(([_, data]) => Date.now() - data.createdAt < 24 * 60 * 60 * 1000) // Last 24h
        .map(([id, data]) => ({
          id,
          email: data.email,
          createdAt: new Date(data.createdAt).toISOString(),
          used: data.used,
          expired: Date.now() > data.expiresAt,
          validFor: data.used ? 'Used' : Date.now() > data.expiresAt ? 'Expired' : `${Math.round((data.expiresAt - Date.now()) / 60000)}min`,
          link: data.token ? `/auth/magic?token=${data.token}` : 'invalid'
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      return NextResponse.json({
        success: true,
        magicLinks: recentLinks,
        total: recentLinks.length,
        staging: true
      })
    }
    
    // Get specific email's latest magic link
    const userLinks = Array.from(magicLinkStorage.values())
      .filter(link => link.email === email)
      .sort((a, b) => b.createdAt - a.createdAt)
    
    if (userLinks.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No magic links found for this email',
        email
      }, { status: 404 })
    }
    
    const latestLink = userLinks[0]
    
    return NextResponse.json({
      success: true,
      email,
      latestLink: {
        token: latestLink.token,
        createdAt: new Date(latestLink.createdAt).toISOString(),
        used: latestLink.used,
        expired: Date.now() > latestLink.expiresAt,
        validFor: latestLink.used ? 'Used' : Date.now() > latestLink.expiresAt ? 'Expired' : `${Math.round((latestLink.expiresAt - Date.now()) / 60000)} minutes`,
        link: `/auth/magic?token=${latestLink.token}`,
        fullUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://gastrotools-bulletproof.vercel.app'}/auth/magic?token=${latestLink.token}`
      }
    })

  } catch (error) {
    console.error('Magic link test API error:', error)
    return NextResponse.json(
      { error: 'Magic link retrieval failed' },
      { status: 500 }
    )
  }
}

// Store magic link for testing (called from magic-link generation)
export async function POST(request: NextRequest) {
  try {
    const { email, token, staging } = await request.json()
    
    if (!staging || process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Only available in staging' },
        { status: 403 }
      )
    }
    
    const linkId = `ml_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    const now = Date.now()
    
    magicLinkStorage.set(linkId, {
      token,
      email,
      createdAt: now,
      used: false,
      expiresAt: now + (15 * 60 * 1000) // 15 minutes
    })
    
    return NextResponse.json({
      success: true,
      stored: true,
      linkId,
      testUrl: `/api/test/magic-links?email=${encodeURIComponent(email)}`
    })

  } catch (error) {
    console.error('Magic link storage error:', error)
    return NextResponse.json(
      { error: 'Magic link storage failed' },
      { status: 500 }
    )
  }
}

// Mark magic link as used (called from verification)
export async function PUT(request: NextRequest) {
  try {
    const { token, staging } = await request.json()
    
    if (!staging || process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Only available in staging' }, { status: 403 })
    }
    
    // Find and mark as used
    for (const [id, data] of magicLinkStorage.entries()) {
      if (data.token === token) {
        data.used = true
        magicLinkStorage.set(id, data)
        
        return NextResponse.json({
          success: true,
          marked: 'used',
          email: data.email
        })
      }
    }
    
    return NextResponse.json(
      { error: 'Magic link not found' },
      { status: 404 }
    )

  } catch (error) {
    return NextResponse.json(
      { error: 'Mark as used failed' },
      { status: 500 }
    )
  }
}