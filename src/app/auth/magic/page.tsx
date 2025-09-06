'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle } from "lucide-react"

function MagicLinkContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')

  useEffect(() => {
    if (token) {
      // Simulate verification
      setTimeout(() => {
        setStatus('success')
        router.push('/dashboard')
      }, 2000)
    } else {
      setStatus('error')
    }
  }, [token, router])

  if (status === 'verifying') {
    return (
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Magic Link wird verifiziert...</h2>
        </CardContent>
      </Card>
    )
  }

  if (status === 'error') {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-red-800">Fehler</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/login')} className="w-full">
            Zur Anmeldung
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md text-center">
      <CardContent className="p-8">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Erfolgreich angemeldet!</h2>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
      </CardContent>
    </Card>
  )
}

export default function MagicLinkPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">Lädt...</h2>
          </CardContent>
        </Card>
      }>
        <MagicLinkContent />
      </Suspense>
    </div>
  )
}