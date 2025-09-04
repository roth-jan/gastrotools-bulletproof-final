'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/navigation"
import { useLanguage } from "@/contexts/LanguageContext"
import { Mail, ArrowLeft, ChefHat } from "lucide-react"

export default function ForgotPasswordPage() {
  const { t, language } = useLanguage()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, language })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || 'Password reset email sent.')
      } else {
        setError(data.error || 'Reset failed')
      }
    } catch (error) {
      setError(language === 'en' ? 'Network error' : 'Netzwerk-Fehler')
    } finally {
      setIsLoading(false)
    }
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
              <CardTitle className="text-2xl">
                {language === 'en' ? 'Reset Password' : 'Passwort zurücksetzen'}
              </CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'Enter your email address and we\'ll send you a reset link' 
                  : 'Geben Sie Ihre E-Mail-Adresse ein für einen Reset-Link'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
                    {success}
                  </div>
                )}
                
                <div>
                  <Label htmlFor="email">
                    {language === 'en' ? 'Email' : 'E-Mail'}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading 
                    ? (language === 'en' ? 'Sending...' : 'Wird gesendet...')
                    : (language === 'en' ? 'Send Reset Email' : 'Reset-E-Mail senden')
                  }
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-purple-600 hover:underline flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {language === 'en' ? 'Back to Login' : 'Zurück zur Anmeldung'}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}