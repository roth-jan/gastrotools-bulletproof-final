'use client'

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ToolsModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'tools' | 'features'
}

export function ToolsModalSimple({ isOpen, onClose, type }: ToolsModalProps) {
  if (!isOpen) return null

  const toolsContent = `
🧮 NÄHRWERTRECHNER
• 20.000+ Zutaten (USDA)
• Deutsche Zutatenerkennung  
• EU-Verordnung konform
• PDF Export

💰 KOSTENKONTROLLE
• Kategorie-Analytics
• Lieferanten-Tracking
• Budget-Überwachung  
• CSV Export

📦 LAGERVERWALTUNG
• Stock-Level-Monitoring
• Mindestbestand-Alerts
• Lieferanten-Integration
• Inventur-Listen

📅 MENÜPLANER  
• Drag & Drop Planung
• 7-Tage-Übersicht
• Portionsberechnung
• Export-Funktionen

🍽️ SPEISEKARTEN-DESIGNER
• 4 Professional Templates
• Kategorie-Management
• PDF Export
• Print-optimiert
  `

  const featuresContent = `
🧠 SMART BUSINESS INTELLIGENCE
Automatische Segmentierung basierend auf Unternehmen und Nutzungsverhalten.
Personalisierte SaaS-Empfehlungen zur richtigen Zeit.

📊 ANALYTICS & ROI-TRACKING  
Vollständige Business-Intelligence mit Lead-Attribution.
Conversion-Tracking und Revenue-Analytics für datengetriebene Entscheidungen.

🔐 ENTERPRISE SECURITY
DSGVO-konform mit Rate-Limiting und Production-Monitoring.
Enterprise-Grade Sicherheit und Compliance-Features.

📱 MOBILE-FIRST DESIGN
Responsive Design für alle Geräte optimiert.
Touch-optimierte Interfaces und perfekte Mobile-Experience.
  `

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-8 max-w-5xl w-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ height: '90vh', minHeight: '600px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {type === 'tools' ? '🔧 Professional Tools' : '✨ Enterprise Features'}
            </h2>
            <p className="text-gray-600 mt-2">
              {type === 'tools' 
                ? 'Vollständige Restaurant-Management-Suite' 
                : 'Enterprise-Level Business Intelligence'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Modal schließen"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto mb-6">
          <div className="prose prose-lg max-w-none">
            <pre className="whitespace-pre-line font-sans text-base leading-relaxed text-gray-700 bg-gray-50 p-6 rounded-lg">
              {type === 'tools' ? toolsContent : featuresContent}
            </pre>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-8 p-4 bg-purple-50 rounded-lg flex items-center justify-between">
          <div>
            <p className="font-semibold text-purple-900">
              {type === 'tools' 
                ? '🚀 Alle 5 Tools sofort nutzen' 
                : '💼 Enterprise Features inklusive'}
            </p>
            <p className="text-sm text-purple-700">
              Kostenloser Zugang nach Registrierung
            </p>
          </div>
          <Button 
            onClick={onClose} 
            className="bg-purple-600 hover:bg-purple-700"
          >
            Jetzt registrieren →
          </Button>
        </div>
      </div>
    </div>
  )
}