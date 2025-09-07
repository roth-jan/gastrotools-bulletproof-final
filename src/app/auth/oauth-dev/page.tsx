'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, User } from "lucide-react"

function OAuthDevContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const provider = searchParams.get('provider') || 'google'
  const email = searchParams.get('email') || ''
  const redirect = searchParams.get('redirect') || '/dashboard'
  
  const [userProfile, setUserProfile] = useState({
    email: email,
    name: '',
    company: '',
    role: ''
  })

  const handleOAuthSuccess = async () => {
    try {
      // Simulate successful OAuth with user profile
      const mockUser = {
        id: `${provider}_${Date.now()}`,
        email: userProfile.email,
        name: userProfile.name || userProfile.email.split('@')[0],
        company: userProfile.company,
        role: userProfile.role,
        provider: provider,
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name || 'User')}&background=4285f4&color=fff`,
        verified: true,
        registeredAt: new Date().toISOString()
      }
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('auth-token', `mock_${provider}_token_${Date.now()}`)
      
      console.log('✅ OAuth Dev Success:', mockUser)
      
      // Redirect to intended destination
      router.push(redirect)
      
    } catch (error) {
      console.error('OAuth dev simulation error:', error)
      alert('OAuth simulation failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Badge className="mx-auto mb-4 bg-yellow-100 text-yellow-800">
            🔧 Development Mode
          </Badge>
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <CardTitle>{provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth Simulation</CardTitle>
          <CardDescription>
            Vervollständigen Sie Ihr Profil für die OAuth-Simulation
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">OAuth-Daten (simuliert)</h3>
            <div className="text-sm text-blue-800">
              <p>E-Mail: <strong>{userProfile.email}</strong></p>
              <p>Provider: <strong>{provider.charAt(0).toUpperCase() + provider.slice(1)}</strong></p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label>Vollständiger Name</Label>
              <Input
                value={userProfile.name}
                onChange={(e) => setUserProfile(prev => ({...prev, name: e.target.value}))}
                placeholder="Max Mustermann"
              />
            </div>
            
            <div>
              <Label>Unternehmen / Einrichtung</Label>
              <Input
                value={userProfile.company}
                onChange={(e) => setUserProfile(prev => ({...prev, company: e.target.value}))}
                placeholder="Grundschule Musterstadt"
              />
            </div>
            
            <div>
              <Label>Ihre Rolle</Label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={userProfile.role}
                onChange={(e) => setUserProfile(prev => ({...prev, role: e.target.value}))}
              >
                <option value="">Rolle auswählen</option>
                <option value="Geschäftsführung">Geschäftsführung / Inhaber</option>
                <option value="Schulleitung">Schulleitung / Direktor</option>
                <option value="Küchenleitung">Küchenleitung / Küchenchef</option>
                <option value="Verwaltung">Verwaltung / Administration</option>
                <option value="IT">IT-Administration</option>
              </select>
            </div>
          </div>

          <Button 
            onClick={handleOAuthSuccess}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            {provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth abschließen
          </Button>
          
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => router.push('/signup-light')}
              className="text-sm"
            >
              Zurück zur Anmeldung
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            🔧 Development-Modus: Simuliert {provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth für Testing
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OAuthDevPage() {
  return (
    <Suspense fallback={<div>Loading OAuth...</div>}>
      <OAuthDevContent />
    </Suspense>
  )
}
