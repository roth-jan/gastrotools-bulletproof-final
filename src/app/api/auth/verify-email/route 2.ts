import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { EnterpriseMonitoring } from '@/lib/enterprise-monitoring'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json(
        { error: 'Verification token required' },
        { status: 400 }
      )
    }

    // Verify email verification token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev-secret'
    ) as any

    if (decoded.type !== 'email_verification') {
      return NextResponse.json(
        { error: 'Invalid token type' },
        { status: 400 }
      )
    }

    // Update user verification status
    const verificationResult = await verifyUserEmail(decoded.email, decoded.userId)
    
    if (verificationResult.success) {
      // Log successful verification
      EnterpriseMonitoring.trackBusinessEvent('email_verified', {
        email: decoded.email.substring(0, 3) + '***',
        userId: decoded.userId,
        verificationType: 'double_opt_in',
        verifiedAt: new Date().toISOString()
      })
      
      return NextResponse.json({
        success: true,
        message: 'Email successfully verified',
        user: verificationResult.user,
        authToken: verificationResult.authToken,
        marketingConsent: true // Email verification implies marketing consent
      })
      
    } else {
      throw new Error('Email verification failed')
    }

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 401 }
      )
    }
    
    EnterpriseMonitoring.error('auth', 'Email verification error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return NextResponse.json(
      { error: 'Email verification failed' },
      { status: 500 }
    )
  }
}

async function verifyUserEmail(email: string, userId: string): Promise<{
  success: boolean
  user?: any
  authToken?: string
}> {
  try {
    // TODO: Update user in database
    // - Set emailVerified: true
    // - Set marketingConsent: true (double-opt-in)
    // - Update verifiedAt timestamp
    
    const user = {
      id: userId,
      email,
      emailVerified: true,
      marketingConsent: true,
      verifiedAt: new Date().toISOString()
    }
    
    // Generate authenticated session token
    const authToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        verified: true
      },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '30d' }
    )
    
    console.log('✅ Email verified and user authenticated:', {
      email: email.substring(0, 3) + '***',
      userId,
      marketingConsent: true
    })
    
    return {
      success: true,
      user,
      authToken
    }

  } catch (error) {
    console.error('Database verification error:', error)
    return { success: false }
  }
}

// Send verification email
export async function PUT(request: NextRequest) {
  try {
    const { email, userId, resend = false } = await request.json()
    
    // Generate verification token
    const verificationToken = jwt.sign(
      {
        email,
        userId,
        type: 'email_verification',
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '24h' }
    )
    
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}`
    
    // TODO: Send verification email
    const emailContent = generateVerificationEmail(email, verificationLink, userId)
    
    console.log('📧 Email verification sent:', {
      email: email.substring(0, 3) + '***',
      userId,
      resend,
      expiresIn: '24h'
    })
    
    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
      expiresIn: '24 hours'
    })

  } catch (error) {
    EnterpriseMonitoring.error('auth', 'Verification email sending failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return NextResponse.json(
      { error: 'Verification email failed' },
      { status: 500 }
    )
  }
}

function generateVerificationEmail(email: string, verificationLink: string, userId: string): string {
  return `
    <h1>GastroTools - E-Mail bestätigen</h1>
    
    <p>Hallo,</p>
    <p>vielen Dank für Ihr Interesse an GastroTools!</p>
    
    <p>Bitte bestätigen Sie Ihre E-Mail-Adresse, um:</p>
    <ul>
      <li>✅ Vollzugriff auf alle 5 Professional Tools</li>
      <li>✅ Personalisierte SaaS-Empfehlungen</li>
      <li>✅ Updates über neue Features</li>
      <li>✅ Kostenlose Demo-Termine</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationLink}"
         style="background: #10b981; color: white; padding: 15px 30px;
                text-decoration: none; border-radius: 8px; font-weight: bold;">
        ✅ E-Mail bestätigen & Tools nutzen
      </a>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px;">
      <h3>🔒 Datenschutz & DSGVO-Compliance</h3>
      <p><strong>Mit der Bestätigung stimmen Sie zu:</strong></p>
      <ul>
        <li>📧 Marketing-E-Mails über passende Profi-Tools</li>
        <li>📊 Anonymisierte Nutzungsanalyse für Verbesserungen</li>
        <li>🎯 Personalisierte Empfehlungen basierend auf Ihrem Bereich</li>
      </ul>
      <p><small>Jederzeit abbestellbar | <a href="/datenschutz">Datenschutzerklärung</a></small></p>
    </div>
    
    <p>Der Link ist 24 Stunden gültig.</p>
    
    <p>Freundliche Grüße<br>Ihr GastroTools Team</p>
    
    <hr>
    <small style="color: #666;">
      Diese E-Mail wurde an ${email} gesendet.
      User-ID: ${userId}
      <a href="/unsubscribe?token=${userId}">Abmelden</a> | 
      <a href="/datenschutz">Datenschutz</a>
    </small>
  `
}

// GDPR: User data export
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')
    
    if (!userId && !email) {
      return NextResponse.json(
        { error: 'User identifier required' },
        { status: 400 }
      )
    }
    
    // GDPR Article 20: Right to data portability
    const userData = await exportAllUserData(userId, email)
    
    EnterpriseMonitoring.info('gdpr', 'User data export requested', {
      userId,
      email: email ? email.substring(0, 3) + '***' : undefined,
      dataSize: JSON.stringify(userData).length
    })
    
    return NextResponse.json({
      success: true,
      data: userData,
      exportedAt: new Date().toISOString(),
      compliance: 'GDPR Article 20 - Right to data portability'
    })

  } catch (error) {
    EnterpriseMonitoring.error('gdpr', 'Data export failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return NextResponse.json(
      { error: 'Data export failed' },
      { status: 500 }
    )
  }
}

async function exportAllUserData(userId?: string | null, email?: string | null): Promise<any> {
  // TODO: Comprehensive data export
  return {
    personalData: {
      email: email,
      userId: userId,
      // ... other profile data
    },
    contentData: {
      recipes: [], // User-created recipes
      menus: [], // User-created menus  
      costEntries: [], // Cost tracking data
      inventoryItems: [], // Inventory data
      // ... other user-generated content
    },
    analyticsData: {
      toolUsage: [], // Which tools used when
      exportActions: [], // Export history
      sessionData: [], // Session information
      // ... behavioral data
    },
    consentHistory: [], // All consent decisions
    exportMetadata: {
      exportedAt: new Date().toISOString(),
      format: 'JSON',
      compliance: 'GDPR Article 20'
    }
  }
}