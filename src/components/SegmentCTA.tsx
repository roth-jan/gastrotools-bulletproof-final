'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Zap, School, Building, Truck } from "lucide-react"

interface SegmentCTAProps {
  segment: 'webmenue' | 'kuechenmanager' | 'ear'
  context: string // e.g., "menu_created", "cost_entries_3+"
  onCTAClick: (segment: string, context: string) => void
}

export function SegmentCTA({ segment, context, onCTAClick }: SegmentCTAProps) {
  const getSegmentConfig = () => {
    switch (segment) {
      case 'webmenue':
        return {
          icon: <School className="w-6 h-6" />,
          color: 'bg-blue-50 border-blue-200',
          title: 'WebMenü für Schulen & Kitas',
          description: 'Bestellungen online und bargeldlos einsammeln (inkl. BuT-Abrechnung)',
          features: ['📱 Online-Bestellung', '💳 Bargeldlos', '🎓 BuT-Abrechnung', '📊 Verwaltung'],
          cta: 'WebMenü ansehen',
          url: '/webmenue'
        }
      case 'kuechenmanager':
        return {
          icon: <Building className="w-6 h-6" />,
          color: 'bg-green-50 border-green-200',
          title: 'KüchenManager für Profis',
          description: 'Warenwirtschaft, Rezepte, Speiseplandruck - alles in einem System',
          features: ['🍽️ Rezeptverwaltung', '📦 Warenwirtschaft', '🖨️ Speiseplandruck', '📈 Controlling'],
          cta: 'KüchenManager testen',
          url: '/kuechenmanager'
        }
      case 'ear':
        return {
          icon: <Truck className="w-6 h-6" />,
          color: 'bg-orange-50 border-orange-200',
          title: 'Essen auf Rädern Digital',
          description: 'Touren, Etiketten, Rechnungen & SEPA in einem Rutsch',
          features: ['🚚 Tourenplanung', '🏷️ Etiketten', '💰 Rechnungen', '🏦 DATEV/SEPA'],
          cta: 'EAR Starterpakete',
          url: '/essen-auf-raedern'
        }
      default:
        return null
    }
  }

  const config = getSegmentConfig()
  if (!config) return null

  return (
    <Card className={`${config.color} mb-6`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="text-blue-600">
            {config.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {config.title}
            </h3>
            <p className="text-gray-700 text-sm mb-3">
              {config.description}
            </p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {config.features.map((feature, index) => (
                <span key={index} className="text-xs text-gray-600">
                  {feature}
                </span>
              ))}
            </div>
            <Button
              size="sm"
              onClick={() => onCTAClick(segment, context)}
              className="text-xs"
            >
              <Zap className="w-3 h-3 mr-1" />
              {config.cta}
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}