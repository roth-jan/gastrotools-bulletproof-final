'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, ArrowRight, Zap, Star } from "lucide-react"
import { UserIntelligence, UserProfile, SmartSuggestion } from "@/lib/user-intelligence"

interface SmartUpsellProps {
  user: UserProfile
  behavior: any
  context: string
  onDismiss: () => void
  onInterest: (saasProduct: string) => void
}

export function SmartUpsell({ user, behavior, context, onDismiss, onInterest }: SmartUpsellProps) {
  const [suggestion, setSuggestion] = useState<SmartSuggestion | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Generate smart suggestion based on user data
    const smartSuggestion = UserIntelligence.generateSmartSuggestion(user, behavior)
    setSuggestion(smartSuggestion)

    // Check if should show upselling
    const shouldShow = UserIntelligence.shouldShowUpselling(user, behavior)
    
    if (!shouldShow) {
      setDismissed(true)
    }
  }, [user, behavior])

  const handleInterest = () => {
    if (suggestion) {
      onInterest(suggestion.saasProduct)
      
      // Track upselling success
      console.log('🎯 Smart Upselling Success:', {
        user: user.email,
        company: user.company,
        segment: suggestion.saasProduct,
        confidence: suggestion.confidence,
        context
      })
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss()
    
    // Track dismissal for optimization
    console.log('📊 Upselling Dismissed:', {
      user: user.email,
      reason: 'user_dismissed',
      context
    })
  }

  if (!suggestion || dismissed) return null

  const saasConfig = {
    webmenue: {
      name: 'WebMenü',
      color: 'from-blue-500 to-blue-600',
      tagline: 'Digitale Schulverpflegung',
      benefits: ['📱 Online-Bestellung', '💳 Bargeldlose Abrechnung', '🎓 BuT-Integration'],
      url: '/webmenue'
    },
    kuechenmanager: {
      name: 'KüchenManager', 
      color: 'from-green-500 to-green-600',
      tagline: 'Professionelle Warenwirtschaft',
      benefits: ['📋 EU-konforme Nährwerte', '🖨️ Speiseplandruck', '💰 DATEV-Integration'],
      url: '/kuechenmanager'
    },
    ear: {
      name: 'EAR - Essen auf Rädern',
      color: 'from-red-500 to-red-600', 
      tagline: 'Lieferservice-Komplettlösung',
      benefits: ['🚚 Tourenplanung', '💰 Rechnungen', '🏦 DATEV/SEPA'],
      url: '/essen-auf-raedern'
    }
  }

  const config = saasConfig[suggestion.saasProduct]

  return (
    <div className="fixed bottom-4 right-4 max-w-sm z-50 animate-in slide-in-from-bottom-2">
      <Card className={`border-l-4 border-l-blue-500 shadow-lg bg-gradient-to-r ${config.color} text-white`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="bg-white/20 text-white mb-2">
                <Star className="w-3 h-3 mr-1" />
                {Math.round(suggestion.confidence * 100)}% Match
              </Badge>
              <CardTitle className="text-lg text-white">
                {config.name}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-white/90 text-sm">
            {config.tagline}
          </p>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="mb-4">
            <p className="text-white/90 text-sm font-medium mb-2">
              💡 Perfekt für {user.company}:
            </p>
            <ul className="text-white/80 text-xs space-y-1">
              {config.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
          
          <div className="mb-3">
            <p className="text-white/90 text-xs">
              {UserIntelligence.getPersonalizedMessage(user, suggestion)}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white hover:bg-white/20 text-xs flex-1"
            >
              Später
            </Button>
            <Button
              onClick={handleInterest}
              className="bg-white text-gray-900 hover:bg-white/90 text-xs flex-1 font-semibold"
            >
              <ArrowRight className="w-3 h-3 mr-1" />
              Ansehen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}