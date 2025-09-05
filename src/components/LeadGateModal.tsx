'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Download, Zap, ArrowRight } from "lucide-react"

interface LeadGateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (leadData: LeadFormData) => void
  exportType: 'pdf' | 'csv'
  toolName: string
  fileName: string
}

export interface LeadFormData {
  email: string
  rolle: string
  orgTyp: string
  interesse: string[]
  consent: boolean
  source: string
  toolUsed: string
  exportType: string
}

export function LeadGateModal({ isOpen, onClose, onSubmit, exportType, toolName, fileName }: LeadGateModalProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    email: '',
    rolle: '',
    orgTyp: '',
    interesse: [],
    consent: false,
    source: 'freeware',
    toolUsed: toolName,
    exportType: exportType
  })
  
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [loading, setLoading] = useState(false)

  const rollen = [
    'Inhaber:in / Geschäftsführung',
    'Küchenleitung',
    'Schulverwaltung', 
    'Facility Management',
    'Einkauf / Controlling',
    'IT-Administration'
  ]

  const orgTypen = [
    'Schule / Kita',
    'Betriebsverpflegung',
    'Senioreneinrichtung',
    'Caterer / Lieferservice',
    'Restaurant / Gastro',
    'Sonstiges'
  ]

  const interesseOptions = [
    { id: 'webmenue', name: 'WebMenü', desc: 'Online-Bestellung, bargeldlos, BuT-Abrechnung' },
    { id: 'kuechenmanager', name: 'KüchenManager', desc: 'Warenwirtschaft, Rezepte, Speiseplandruck' },
    { id: 'ear', name: 'Essen auf Rädern', desc: 'Tourenplanung, Rechnungen, DATEV/SEPA' }
  ]

  const handleInteresseChange = (produktId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        interesse: [...prev.interesse, produktId]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        interesse: prev.interesse.filter(id => id !== produktId)
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.email) {
      newErrors.email = 'E-Mail ist erforderlich'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse'
    }

    if (!formData.rolle) {
      newErrors.rolle = 'Bitte wählen Sie Ihre Rolle'
    }

    if (!formData.orgTyp) {
      newErrors.orgTyp = 'Bitte wählen Sie Ihren Bereich'
    }

    if (!formData.consent) {
      newErrors.consent = 'Bitte stimmen Sie der Datenverarbeitung zu'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      // Submit lead data
      await onSubmit(formData)
      
    } catch (error) {
      console.error('Lead submission error:', error)
      setErrors({ submit: 'Fehler beim Absenden. Bitte versuchen Sie es erneut.' })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                {exportType === 'pdf' ? 'PDF Export' : 'CSV Export'}
              </CardTitle>
              <CardDescription>
                Holen Sie sich Ihren {fileName} per E-Mail + passende Profi-Tools
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <Label htmlFor="email">E-Mail-Adresse *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                placeholder="ihre@email.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              <p className="text-xs text-gray-500 mt-1">
                💡 Wir senden Ihnen den {exportType.toUpperCase()} + passende Profi-Tools für Ihren Bereich
              </p>
            </div>

            {/* Rolle */}
            <div>
              <Label>Ihre Rolle *</Label>
              <Select value={formData.rolle} onValueChange={(value) => setFormData(prev => ({...prev, rolle: value}))}>
                <SelectTrigger className={errors.rolle ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Rolle auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {rollen.map(rolle => (
                    <SelectItem key={rolle} value={rolle}>{rolle}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.rolle && <p className="text-sm text-red-500 mt-1">{errors.rolle}</p>}
            </div>

            {/* Organisation Type */}
            <div>
              <Label>Ihr Bereich *</Label>
              <Select value={formData.orgTyp} onValueChange={(value) => setFormData(prev => ({...prev, orgTyp: value}))}>
                <SelectTrigger className={errors.orgTyp ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Bereich auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {orgTypen.map(typ => (
                    <SelectItem key={typ} value={typ}>{typ}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.orgTyp && <p className="text-sm text-red-500 mt-1">{errors.orgTyp}</p>}
            </div>

            {/* Interesse (Optional) */}
            <div>
              <Label>Interesse an Profi-Lösungen (optional)</Label>
              <div className="space-y-3 mt-2">
                {interesseOptions.map(option => (
                  <div key={option.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={option.id}
                      checked={formData.interesse.includes(option.id)}
                      onCheckedChange={(checked) => handleInteresseChange(option.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <label htmlFor={option.id} className="font-medium cursor-pointer">
                        {option.name}
                      </label>
                      <p className="text-sm text-gray-600">{option.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Wählen Sie passende Lösungen - wir schicken Ihnen relevante Infos
              </p>
            </div>

            {/* Consent */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consent"
                checked={formData.consent}
                onCheckedChange={(checked) => setFormData(prev => ({...prev, consent: checked as boolean}))}
                className={errors.consent ? 'border-red-500' : ''}
              />
              <div className="text-sm">
                <label htmlFor="consent" className="cursor-pointer">
                  Ich stimme zu, dass meine Daten zur Zusendung des Exports und für Informationen über passende Profi-Lösungen verwendet werden. *
                </label>
                {errors.consent && <p className="text-red-500 mt-1">{errors.consent}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  📧 Double-Opt-In • 🗑️ Jederzeit abbestellbar • 🔒 <a href="/datenschutz" className="underline">Datenschutz</a>
                </p>
              </div>
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {errors.submit}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>⏳ Sende...</>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    {exportType.toUpperCase()} per E-Mail erhalten
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}