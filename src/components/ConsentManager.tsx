'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, Cookie, Eye, Mail } from "lucide-react"

interface ConsentPreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  personalization: boolean
}

export function ConsentManager() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false, 
    personalization: false
  })

  useEffect(() => {
    // Check if consent already given
    const consent = localStorage.getItem('gdpr_consent')
    if (!consent) {
      // Show banner after 2 seconds
      setTimeout(() => setShowBanner(true), 2000)
    } else {
      // Load existing preferences
      try {
        setPreferences(JSON.parse(consent))
      } catch (e) {
        console.error('Consent parsing error:', e)
      }
    }
  }, [])

  const handleConsentAll = () => {
    const fullConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true
    }
    
    saveConsent(fullConsent)
  }

  const handleConsentNecessaryOnly = () => {
    const minimalConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false
    }
    
    saveConsent(minimalConsent)
  }

  const handleCustomConsent = () => {
    saveConsent(preferences)
  }

  const saveConsent = (consent: ConsentPreferences) => {
    // Save consent with timestamp
    const consentRecord = {
      ...consent,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
    
    localStorage.setItem('gdpr_consent', JSON.stringify(consentRecord))
    
    // Log consent for GDPR compliance
    console.log('GDPR Consent recorded:', consentRecord)
    
    // Send to backend for logging
    fetch('/api/consent/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consentRecord)
    }).catch(e => console.error('Consent logging error:', e))
    
    setShowBanner(false)
    setShowDetails(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
      <div className="container mx-auto p-4">
        {!showDetails ? (
          // Simple Banner
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Cookie className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">🍪 Cookies & Datenschutz</p>
                <p className="text-sm text-gray-600">
                  Wir verwenden Cookies für beste Nutzererfahrung. Details in der{' '}
                  <a href="/datenschutz" className="text-blue-600 underline">Datenschutzerklärung</a>.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(true)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Details
              </Button>
              <Button
                size="sm"
                onClick={handleConsentNecessaryOnly}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Nur Notwendige
              </Button>
              <Button
                size="sm" 
                onClick={handleConsentAll}
                className="bg-green-600 hover:bg-green-700"
              >
                Alle akzeptieren
              </Button>
            </div>
          </div>
        ) : (
          // Detailed Preferences
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Cookie & Datenschutz Einstellungen</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start justify-between p-3 border rounded">
                  <div className="flex-1">
                    <h4 className="font-medium">Notwendige Cookies</h4>
                    <p className="text-sm text-gray-600">
                      Für Login, Speichern Ihrer Einstellungen, Sicherheit
                    </p>
                  </div>
                  <Checkbox checked={true} disabled className="mt-1" />
                </div>
                
                <div className="flex items-start justify-between p-3 border rounded">
                  <div className="flex-1">
                    <h4 className="font-medium">Analytics</h4>
                    <p className="text-sm text-gray-600">
                      Tool-Nutzung anonymisiert für Verbesserungen
                    </p>
                  </div>
                  <Checkbox 
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => setPreferences(prev => ({...prev, analytics: checked as boolean}))}
                    className="mt-1" 
                  />
                </div>
                
                <div className="flex items-start justify-between p-3 border rounded">
                  <div className="flex-1">
                    <h4 className="font-medium">Marketing</h4>
                    <p className="text-sm text-gray-600">
                      E-Mail-Updates über passende Profi-Lösungen
                    </p>
                  </div>
                  <Checkbox 
                    checked={preferences.marketing}
                    onCheckedChange={(checked) => setPreferences(prev => ({...prev, marketing: checked as boolean}))}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex items-start justify-between p-3 border rounded">
                  <div className="flex-1">
                    <h4 className="font-medium">Personalisierung</h4>
                    <p className="text-sm text-gray-600">
                      Segment-spezifische Empfehlungen basierend auf Ihrer Nutzung
                    </p>
                  </div>
                  <Checkbox 
                    checked={preferences.personalization}
                    onCheckedChange={(checked) => setPreferences(prev => ({...prev, personalization: checked as boolean}))}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline" 
                  onClick={() => setShowDetails(false)}
                  className="flex-1"
                >
                  Zurück
                </Button>
                <Button
                  onClick={handleCustomConsent}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Einstellungen speichern
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-3 text-center">
                <Shield className="w-3 h-3 inline mr-1" />
                Ihre Daten werden DSGVO-konform verarbeitet. 
                <a href="/datenschutz" className="underline">Datenschutzerklärung</a> | 
                <a href="/impressum" className="underline">Impressum</a>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}