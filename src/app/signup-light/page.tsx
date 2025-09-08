'use client'

import { useState, useEffect } from 'react'
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
  const [showTools, setShowTools] = useState(false)
  const [showFeatures, setShowFeatures] = useState(false)

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

  // INLINE: Listen to navigation events for Tools/Features
  useEffect(() => {
    const handleToggleTools = () => setShowTools(!showTools)
    const handleToggleFeatures = () => setShowFeatures(!showFeatures)
    
    window.addEventListener('toggleTools', handleToggleTools)
    window.addEventListener('toggleFeatures', handleToggleFeatures)
    
    return () => {
      window.removeEventListener('toggleTools', handleToggleTools)
      window.removeEventListener('toggleFeatures', handleToggleFeatures)
    }
  }, [showTools, showFeatures])

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
            <CardTitle className="text-2xl">Sofort starten</CardTitle>
            <CardDescription>
              Magic-Link: Sicher, schnell, keine Passwörter nötig
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
            
            {/* CLEAN: Focus on Magic-Link (modern + working) */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                💡 Magic-Link: Sicher, schnell, keine Passwörter nötig
              </p>
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

        {/* INLINE CONTENT: Tools Section */}
        {showTools && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                🔧 Professional Tools
                <Button variant="ghost" size="sm" onClick={() => setShowTools(false)}>×</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="border-l-4 border-l-blue-500 pl-4">
                  <h4 className="font-semibold">🧮 Nährwertrechner</h4>
                  <p>20.000+ Zutaten (USDA) • Deutsche Zutatenerkennung • EU-konform • PDF Export</p>
                </div>
                <div className="border-l-4 border-l-green-500 pl-4">
                  <h4 className="font-semibold">💰 Kostenkontrolle</h4>
                  <p>Kategorie-Analytics • Lieferanten-Tracking • Budget-Überwachung • CSV Export</p>
                </div>
                <div className="border-l-4 border-l-purple-500 pl-4">
                  <h4 className="font-semibold">📦 Lagerverwaltung</h4>
                  <p>Stock-Monitoring • Mindestbestand-Alerts • Lieferanten-Integration • Inventur</p>
                </div>
                <div className="border-l-4 border-l-orange-500 pl-4">
                  <h4 className="font-semibold">📅 Menüplaner</h4>
                  <p>Drag & Drop Planung • 7-Tage-Übersicht • Portionsberechnung • Export</p>
                </div>
                <div className="border-l-4 border-l-red-500 pl-4">
                  <h4 className="font-semibold">🍽️ Speisekarten-Designer</h4>
                  <p>4 Templates • Kategorie-Management • PDF Export • Print-optimiert</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* INLINE CONTENT: Features Section */}
        {showFeatures && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                ✨ Enterprise Features
                <Button variant="ghost" size="sm" onClick={() => setShowFeatures(false)}>×</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="border-l-4 border-l-blue-500 pl-4">
                  <h4 className="font-semibold">🧠 Smart Business Intelligence</h4>
                  <p>Automatische Segmentierung basierend auf Unternehmen und Nutzungsverhalten. Personalisierte SaaS-Empfehlungen zur richtigen Zeit.</p>
                </div>
                <div className="border-l-4 border-l-green-500 pl-4">
                  <h4 className="font-semibold">📊 Analytics & ROI-Tracking</h4>
                  <p>Vollständige Business-Intelligence mit Lead-Attribution. Conversion-Tracking und Revenue-Analytics für datengetriebene Entscheidungen.</p>
                </div>
                <div className="border-l-4 border-l-purple-500 pl-4">
                  <h4 className="font-semibold">🔐 Enterprise Security</h4>
                  <p>DSGVO-konform mit Rate-Limiting und Production-Monitoring. Enterprise-Grade Sicherheit und Compliance.</p>
                </div>
                <div className="border-l-4 border-l-orange-500 pl-4">
                  <h4 className="font-semibold">📱 Mobile-First Design</h4>
                  <p>Responsive Design für alle Geräte optimiert. Touch-optimierte Interfaces und perfekte Mobile-Experience.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}