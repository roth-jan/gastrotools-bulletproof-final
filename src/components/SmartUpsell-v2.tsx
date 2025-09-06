'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, ArrowRight, Zap, Star } from "lucide-react"

export function SmartUpsellV2({ user, behavior, context, onDismiss, onInterest }: any) {
  const [dismissed, setDismissed] = useState(false)

  // ENTERPRISE: Smart trigger conditions
  const shouldShow = () => {
    // Frequency capping: 7 days
    const lastShown = localStorage.getItem(`upsell_shown_${user.email}`)
    if (lastShown) {
      const daysSince = Math.floor((Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24))
      if (daysSince < 7) return false
    }
    
    // Trigger-based conditions
    const triggers = {
      export_succeeded: context === 'pdf_export_success',
      menu_items_created: behavior.menuItemsPlanned >= 1,
      cost_entries_added: behavior.costEntriesAdded >= 3,
      value_proven: behavior.exportActions >= 1
    }
    
    // Role-based targeting
    const roleMatch = user.role?.toLowerCase().includes('leitung') ||
                     user.role?.toLowerCase().includes('geschäfts') ||
                     user.role?.toLowerCase().includes('koch')
    
    // Org-type targeting  
    const orgMatch = user.orgType?.toLowerCase().includes('schule') ||
                    user.orgType?.toLowerCase().includes('kita') ||
                    user.orgType?.toLowerCase().includes('restaurant')
    
    return (triggers.export_succeeded || triggers.menu_items_created || triggers.value_proven) &&
           (roleMatch || orgMatch)
  }

  // Auto-dismiss on mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      const timer = setTimeout(() => setDismissed(true), 7000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleInterestClick = () => {
    // Track frequency
    localStorage.setItem(`upsell_shown_${user.email}`, Date.now().toString())
    onInterest('webmenue') // Smart segment detection can be added
  }

  const handleDismissClick = () => {
    localStorage.setItem(`upsell_dismissed_${user.email}`, Date.now().toString())
    setDismissed(true)
    onDismiss()
  }

  if (dismissed || !shouldShow()) return null

  return (
    <div 
      className="fixed z-50 animate-in slide-in-from-bottom-2 max-w-sm
                 top-4 left-1/2 transform -translate-x-1/2
                 md:bottom-4 md:right-4 md:left-auto md:top-auto md:transform-none"
      role="alert"
      aria-live="polite"
      aria-label="Smart business recommendation"
    >
      <Card className="border-l-4 border-l-blue-500 shadow-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="bg-white/20 text-white mb-2">
                <Star className="w-3 h-3 mr-1" />
                95% Match
              </Badge>
              <CardTitle className="text-lg text-white">
                WebMenü für {user.company}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissClick}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-white/90 text-sm font-medium mb-3">
            💡 Online-Bestellungen + bargeldlose Abrechnung für Ihre Schüler
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissClick}
              className="text-white hover:bg-white/20 text-xs flex-1"
            >
              Später
            </Button>
            <Button
              onClick={handleInterestClick}
              className="bg-white text-blue-600 hover:bg-blue-50 text-xs flex-1 font-semibold"
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