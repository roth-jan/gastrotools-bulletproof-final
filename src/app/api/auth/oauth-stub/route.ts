import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { provider, action, email } = await request.json()
    
    // OAuth Stub for staging testing
    if (process.env.NODE_ENV !== 'development' && !process.env.OAUTH_STUB) {
      return NextResponse.json(
        { error: 'OAuth stub not available in production' },
        { status: 403 }
      )
    }

    if (action === 'approve') {
      // Simulate successful OAuth
      const mockUser = {
        id: `${provider}_${Date.now()}`,
        email,
        name: email.split('@')[0].replace(/[^a-z]/gi, ' ').trim(),
        provider,
        picture: `https://via.placeholder.com/64/${provider === 'google' ? '4285f4' : 'ff6600'}/FFFFFF?text=${provider.charAt(0).toUpperCase()}`,
        verified: true
      }
      
      // Log OAuth success
      console.log('🔐 OAuth Stub - User Approved:', {
        provider,
        email,
        userId: mockUser.id,
        stubMode: true
      })
      
      return NextResponse.json({
        success: true,
        user: mockUser,
        action: 'approved',
        stubMode: true,
        redirect: '/dashboard?oauth_success=true'
      })
      
    } else if (action === 'deny') {
      // Simulate OAuth denial
      console.log('🚫 OAuth Stub - User Denied:', { provider, email })
      
      return NextResponse.json({
        success: false,
        error: 'User denied OAuth authorization',
        action: 'denied',
        stubMode: true,
        redirect: '/signup-light?oauth_error=denied'
      })
      
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use approve or deny.' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('OAuth stub error:', error)
    return NextResponse.json(
      { error: 'OAuth stub failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Show OAuth stub interface
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider') || 'google'
    const email = searchParams.get('email') || 'test@example.com'
    
    const stubHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>OAuth Stub - ${provider.charAt(0).toUpperCase() + provider.slice(1)}</title>
        <style>
          body { font-family: system-ui; padding: 40px; text-align: center; background: #f3f4f6; }
          .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .banner { background: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
          .provider { color: ${provider === 'google' ? '#4285f4' : '#ff6600'}; font-weight: bold; }
          button { padding: 12px 24px; margin: 8px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; }
          .approve { background: #10b981; color: white; }
          .deny { background: #ef4444; color: white; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="banner">
            <strong>⚠️ OAuth-Stub aktiv</strong><br>
            <small>Staging-Modus für E2E-Tests</small>
          </div>
          
          <h2>Anmelden mit <span class="provider">${provider.charAt(0).toUpperCase() + provider.slice(1)}</span></h2>
          <p>Möchten Sie <strong>${email}</strong> für GastroTools autorisieren?</p>
          
          <div style="margin: 30px 0;">
            <button class="approve" onclick="submitAction('approve')">
              ✅ Autorisieren
            </button>
            <button class="deny" onclick="submitAction('deny')">
              ❌ Ablehnen
            </button>
          </div>
          
          <div style="font-size: 12px; color: #6b7280;">
            <p>Stub-Modus: Keine echte ${provider.charAt(0).toUpperCase() + provider.slice(1)}-Verbindung</p>
          </div>
        </div>
        
        <script>
          async function submitAction(action) {
            try {
              const response = await fetch('/api/auth/oauth-stub', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  provider: '${provider}',
                  email: '${email}',
                  action: action
                })
              });
              
              const result = await response.json();
              
              if (result.success || result.redirect) {
                window.location.href = result.redirect;
              } else {
                alert('OAuth Stub Error: ' + result.error);
              }
              
            } catch (error) {
              alert('OAuth Stub failed: ' + error.message);
            }
          }
        </script>
      </body>
      </html>
    `
    
    return new NextResponse(stubHTML, {
      headers: { 'Content-Type': 'text/html' }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'OAuth stub interface failed' },
      { status: 500 }
    )
  }
}