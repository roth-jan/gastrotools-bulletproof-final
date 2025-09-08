'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Calculator, DollarSign, Package, Calendar, ChefHat, ArrowRight } from "lucide-react"

interface ToolsModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'tools' | 'features'
}

export function ToolsModal({ isOpen, onClose, type }: ToolsModalProps) {
  if (!isOpen) return null

  const tools = [
    {
      icon: <Calculator className="w-6 h-6 text-blue-600" />,
      name: 'Nährwertrechner',
      description: 'EU-konforme Nährwertberechnung mit USDA-Datenbank',
      features: ['20.000+ Zutaten', 'Deutsche Zutatenerkennung', 'EU-Verordnung konform', 'PDF Export']
    },
    {
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
      name: 'Kostenkontrolle',
      description: 'Wareneinsatz-Management und Food-Cost-Analyse',
      features: ['Kategorie-Analytics', 'Lieferanten-Tracking', 'Budget-Überwachung', 'CSV Export']
    },
    {
      icon: <Package className="w-6 h-6 text-purple-600" />,
      name: 'Lagerverwaltung',
      description: 'Bestandsführung mit automatischen Alerts',
      features: ['Stock-Level-Monitoring', 'Mindestbestand-Alerts', 'Lieferanten-Integration', 'Inventur-Listen']
    },
    {
      icon: <Calendar className="w-6 h-6 text-orange-600" />,
      name: 'Menüplaner',
      description: 'Wochenplanung mit Drag & Drop Interface',
      features: ['Drag & Drop Planung', '7-Tage-Übersicht', 'Portionsberechnung', 'Export-Funktionen']
    },
    {
      icon: <ChefHat className="w-6 h-6 text-red-600" />,
      name: 'Speisekarten-Designer',
      description: 'Professionelle Speisekarten-Erstellung',
      features: ['4 Professional Templates', 'Kategorie-Management', 'PDF Export', 'Print-optimiert']
    }
  ]

  const features = [
    {
      title: '🧠 Smart Business Intelligence',
      description: 'Automatische Segmentierung und personalisierte SaaS-Empfehlungen',
      details: 'Basierend auf Ihrem Unternehmen und Nutzungsverhalten empfehlen wir passende Professional-Tools'
    },
    {
      title: '📊 Analytics & ROI-Tracking',
      description: 'Vollständige Business-Intelligence mit Conversion-Tracking',
      details: 'Lead-Attribution, Segment-Performance und Revenue-Tracking für datengetriebene Entscheidungen'
    },
    {
      title: '🔐 Enterprise Security',
      description: 'DSGVO-konform mit Rate-Limiting und Monitoring',
      details: 'Professioneller Schutz vor Missbrauch, GDPR-Compliance und Enterprise-Grade Sicherheit'
    },
    {
      title: '📱 Mobile-First Design',
      description: 'Responsive Design für alle Geräte optimiert',
      details: 'Perfekte Nutzererfahrung auf Desktop, Tablet und Smartphone mit Touch-optimierten Interfaces'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full my-4 sm:my-8 min-h-fit"
           style={{ maxHeight: 'calc(100vh - 2rem)' }}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {type === 'tools' ? 'Professional Tools' : 'Enterprise Features'}
            </h2>
            <p className="text-gray-600">
              {type === 'tools' 
                ? 'Vollständige Restaurant-Management-Suite' 
                : 'Enterprise-Level Business Intelligence'}
            </p>
          </div>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
          {type === 'tools' ? (
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {tools.map((tool, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      {tool.icon}
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                    </div>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {tool.features.map((feature, i) => (
                        <div key={i} className="flex items-center text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {features.map((feature, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{feature.details}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {type === 'tools' 
                  ? 'Alle 5 Tools kostenlos nutzen' 
                  : 'Enterprise Features inklusive'}
              </p>
              <p className="text-sm text-gray-600">
                Sofortiger Zugang nach Registrierung
              </p>
            </div>
            <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700">
              <ArrowRight className="w-4 h-4 mr-2" />
              Jetzt registrieren
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}