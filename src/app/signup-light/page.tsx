'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { Mail, Zap, ArrowRight, Shield, Clock } from "lucide-react"

export default function LightSignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const handleMagicLinkSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) return
    
    setIsLoading(true)
    
    try {
      // Send magic link
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          source: 'light_signup'
        })
      })
      
      if (response.ok) {
        setMagicLinkSent(true)
        
        // Track conversion
        console.log('✅ Light signup conversion:', email)
        
        // Auto-detect segment from email domain
        const domain = email.split('@')[1]?.toLowerCase()
        let detectedSegment = 'general'
        
        if (domain?.includes('schule') || domain?.includes('kita') || domain?.includes('.edu')) {
          detectedSegment = 'webmenue'
        } else if (domain?.includes('restaurant') || domain?.includes('gastro')) {
          detectedSegment = 'kuechenmanager'
        } else if (domain?.includes('senioren') || domain?.includes('pflege')) {
          detectedSegment = 'ear'
        }
        
        // Store for progressive profiling
        localStorage.setItem('signup_email', email)
        localStorage.setItem('detected_segment', detectedSegment)
        
      } else {
        throw new Error('Magic link failed')
      }
      
    } catch (error) {
      console.error('Light signup error:', error)
      alert('Magic Link konnte nicht gesendet werden. Bitte versuchen Sie es erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: 'google' | 'microsoft') => {
    // STAGING: Redirect to OAuth stub for testing  
    if (process.env.NODE_ENV === 'development' || window.location.hostname.includes('vercel.app')) {
      window.open(`/api/auth/oauth-stub?provider=${provider}&email=${email || 'test@example.com'}`, '_blank')
    } else {
      // Production: Real OAuth (when implemented)
      window.location.href = `/api/auth/${provider}?redirect=/dashboard`
    }
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle>Magic Link gesendet!</CardTitle>
            <CardDescription>
              Wir haben Ihnen einen Link an <strong>{email}</strong> gesendet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Nächste Schritte:</h3>
                <ol className="text-sm text-blue-800 space-y-1 text-left">
                  <li>1. E-Mail öffnen</li>
                  <li>2. "Jetzt anmelden" klicken</li>
                  <li>3. Sofort alle Tools nutzen</li>
                </ol>
              </div>
              
              <p className="text-xs text-gray-500">
                Kein Link erhalten? Spam-Ordner prüfen oder{' '}
                <button 
                  onClick={() => setMagicLinkSent(false)}
                  className="text-blue-600 underline"
                >
                  erneut senden
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      <Navigation />
      
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Badge className="mx-auto mb-4 bg-purple-100 text-purple-800">
              <Zap className="w-4 h-4 mr-1" />
              Sofort starten
            </Badge>
            <CardTitle className="text-2xl">Direkt zu den Tools</CardTitle>
            <CardDescription>
              Keine langen Formulare - einfach E-Mail und loslegen
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Magic Link Signup */}
            <form onSubmit={handleMagicLinkSignup} className="space-y-4">
              <div>
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ihre@email.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  🔒 Sicher, DSGVO-konform, jederzeit löschbar
                </p>
              </div>
              
              <Button 
                type="submit" 
                disabled={!email || isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <>⏳ Sendet Magic Link...</>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Magic Link senden
                  </>
                )}
              </Button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">oder</span>
              </div>
            </div>
            
            {/* Social Login */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('google')}
                className="w-full"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Mit Google anmelden
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('microsoft')}
                className="w-full"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M1 1h10v10H1z"/>
                  <path fill="#00A4EF" d="M13 1h10v10H13z"/>
                  <path fill="#7FBA00" d="M1 13h10v10H1z"/>
                  <path fill="#FFB900" d="M13 13h10v10H13z"/>
                </svg>
                Mit Microsoft anmelden
              </Button>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500">
                <Shield className="w-3 h-3 inline mr-1" />
                Sofortiger Zugang zu allen 5 Profi-Tools
              </p>
              <p className="text-xs text-gray-500">
                <Clock className="w-3 h-3 inline mr-1" />
                Keine Kreditkarte erforderlich
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}