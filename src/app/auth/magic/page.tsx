'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, AlertCircle, ArrowRight, Building, User } from "lucide-react"

export default function MagicLinkVerificationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying')
  const [userEmail, setUserEmail] = useState('')
  const [detectedSegment, setDetectedSegment] = useState('')
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  
  // Progressive profiling form
  const [profileData, setProfileData] = useState({
    company: '',
    role: '',
    orgType: '',
    teamSize: '',
    primaryInterest: ''
  })

  useEffect(() => {
    if (token) {
      verifyMagicLink()
    } else {
      setVerificationStatus('error')
    }
  }, [token])

  const verifyMagicLink = async () => {
    try {
      const response = await fetch('/api/auth/verify-magic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const result = await response.json()

      if (response.ok) {
        setVerificationStatus('success')
        setUserEmail(result.email)
        setDetectedSegment(result.segment)
        
        // Check if user needs onboarding
        if (!result.hasProfile) {
          setNeedsOnboarding(true)
        } else {
          // Direct login
          localStorage.setItem('token', result.authToken)
          localStorage.setItem('user', JSON.stringify(result.user))
          
          // Smart routing based on segment
          const routes = {
            webmenue: '/dashboard?welcome=webmenue',
            kuechenmanager: '/dashboard?welcome=kuechenmanager', 
            ear: '/dashboard?welcome=ear',
            general: '/dashboard'
          }
          
          router.push(routes[result.segment as keyof typeof routes] || '/dashboard')
        }
        
      } else if (response.status === 401) {
        setVerificationStatus('expired')
      } else {
        setVerificationStatus('error')
      }

    } catch (error) {
      console.error('Magic link verification error:', error)
      setVerificationStatus('error')
    }
  }

  const handleProgressiveOnboarding = async () => {
    try {
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          ...profileData,
          detectedSegment
        })
      })

      const result = await response.json()

      if (response.ok) {
        localStorage.setItem('token', result.authToken)
        localStorage.setItem('user', JSON.stringify(result.user))
        
        // Smart welcome routing
        const welcomeRoutes = {
          webmenue: `/dashboard?welcome=webmenue&company=${encodeURIComponent(profileData.company)}`,
          kuechenmanager: `/dashboard?welcome=kuechenmanager&role=${encodeURIComponent(profileData.role)}`,
          ear: `/dashboard?welcome=ear&team=${profileData.teamSize}`,
          general: '/dashboard?welcome=true'
        }
        
        router.push(welcomeRoutes[detectedSegment as keyof typeof welcomeRoutes] || '/dashboard')
        
      } else {
        alert('Profile completion failed. Please try again.')
      }

    } catch (error) {
      console.error('Profile completion error:', error)
    }
  }

  const roles = [
    'Geschäftsführung / Inhaber',
    'Schulleitung / Direktor', 
    'Küchenleitung / Küchenchef',
    'Facility Management',
    'Verwaltung / Administration',
    'IT-Administration',
    'Einkauf / Controlling'
  ]

  const orgTypes = [
    'Grundschule',
    'Gymnasium / Realschule', 
    'Kita / Kindergarten',
    'Betriebskantine',
    'Restaurant',
    'Hotel / Gastronomie',
    'Catering-Unternehmen',
    'Senioreneinrichtung',
    'Krankenhaus / Klinik'
  ]

  if (verificationStatus === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Magic Link wird verifiziert...</h2>
            <p className="text-gray-600">
              Einen Moment bitte, wir richten Ihren Zugang ein.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (verificationStatus === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-800">Link abgelaufen</CardTitle>
            <CardDescription>
              Ihr Magic Link ist nicht mehr gültig (15 Minuten Zeitlimit)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/signup-light')} className="w-full">
              Neuen Link anfordern
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-800">Fehler</CardTitle>
            <CardDescription>
              Magic Link konnte nicht verifiziert werden
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/login')} className="w-full">
              Zur Anmeldung
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <CardTitle>Willkommen bei GastroTools!</CardTitle>
            <CardDescription>
              Vervollständigen Sie Ihr Profil für personalisierte Empfehlungen
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">📧 Bestätigt: {userEmail}</h3>
              <p className="text-sm text-blue-800">
                Erkannter Bereich: <strong>{detectedSegment}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Unternehmen / Einrichtung</Label>
                <Input
                  value={profileData.company}
                  onChange={(e) => setProfileData(prev => ({...prev, company: e.target.value}))}
                  placeholder="z.B. Grundschule Musterstadt"
                />
              </div>
              <div>
                <Label>Ihre Rolle</Label>
                <Select value={profileData.role} onValueChange={(value) => setProfileData(prev => ({...prev, role: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rolle wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Bereich / Organisation</Label>
              <Select value={profileData.orgType} onValueChange={(value) => setProfileData(prev => ({...prev, orgType: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Bereich auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {orgTypes.map(org => (
                    <SelectItem key={org} value={org}>{org}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Team-Größe</Label>
                <Select value={profileData.teamSize} onValueChange={(value) => setProfileData(prev => ({...prev, teamSize: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Anzahl" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1-5 Personen</SelectItem>
                    <SelectItem value="6-20">6-20 Personen</SelectItem>
                    <SelectItem value="21-100">21-100 Personen</SelectItem>
                    <SelectItem value="100+">100+ Personen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Hauptinteresse</Label>
                <Select value={profileData.primaryInterest} onValueChange={(value) => setProfileData(prev => ({...prev, primaryInterest: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Interesse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cost-optimization">Kostenkontrolle</SelectItem>
                    <SelectItem value="menu-planning">Menüplanung</SelectItem>
                    <SelectItem value="nutrition">Nährwerte</SelectItem>
                    <SelectItem value="inventory">Lagerverwaltung</SelectItem>
                    <SelectItem value="menu-cards">Speisekarten</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleProgressiveOnboarding}
              disabled={!profileData.company || !profileData.role}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Profil vervollständigen & Tools nutzen
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              Optional: Hilft uns, Ihnen die passenden Profi-Tools zu empfehlen
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success without onboarding (shouldn't reach here)
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erfolgreich angemeldet!</h2>
          <p className="text-gray-600 mb-4">Weiterleitung zu den Tools...</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
        </CardContent>
      </Card>
    </div>
  )
}