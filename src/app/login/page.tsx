'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/navigation"
import { useLanguage } from "@/contexts/LanguageContext"
import { Mail, Lock, ChefHat } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Get redirect URL from query params
  const redirect = searchParams?.get('redirect') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Use the correct API route
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store auth data
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        // Redirect to intended page or dashboard
        router.push(redirect)
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error - please try again')
    } finally {
      setIsLoading(false)
    }
  }

  // Demo login function
  const handleDemoLogin = async () => {
    setFormData({
      email: 'demo@gastrotools.de',
      password: 'demo123'
    })

    // Auto-submit after setting demo credentials
    setTimeout(() => {
      const form = document.getElementById('login-form') as HTMLFormElement
      if (form) {
        form.requestSubmit()
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="w-full max-w-md glass">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">Anmelden bei GastroTools</CardTitle>
              <CardDescription>
                Willkommen zurück! Melden Sie sich an, um fortzufahren.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <Label htmlFor="email">E-Mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Passwort</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Password"
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <Link href="/forgot-password" className="text-sm text-purple-600 hover:underline">
                  Passwort vergessen?
                </Link>
                <div className="text-sm text-gray-600">
                  Noch kein Konto?{' '}
                  <Link href="/signup-light" className="text-purple-600 hover:underline">
                    Konto erstellen
                  </Link>
                </div>
              </div>

              {/* Demo Login Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Demo-Zugang</h4>
                <p className="text-sm text-blue-800 mb-2">
                  Testen Sie alle Funktionen mit unserem Demo-Konto:
                </p>
                <div className="text-sm space-y-1">
                  <div><strong>E-Mail:</strong> demo@gastrotools.de</div>
                  <div><strong>Passwort:</strong> demo123</div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-3"
                  onClick={handleDemoLogin}
                >
                  Demo-Konto verwenden
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}