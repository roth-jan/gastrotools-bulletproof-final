'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { leadTracker } from "@/lib/lead-tracking"
import { ChefHat, Calculator, Printer, Package, Euro, ArrowRight, CheckCircle, Calendar, Building } from "lucide-react"

export default function KüchenManagerLanding() {
  const [email, setEmail] = useState('')
  const [demosBooked, setDemosBooked] = useState(0)

  const handleDemoRequest = async () => {
    await leadTracker.track({
      event: 'demo_requested',
      timestamp: '',
      sessionId: '',
      properties: {
        product: 'kuechenmanager',
        source: 'landing_page',
        email
      }
    })
    
    setDemosBooked(prev => prev + 1)
  }

  const features = [
    {
      icon: <Calculator className="w-8 h-8 text-green-600" />,
      title: 'EU-konforme Nährwerte',
      description: 'Rezeptverwaltung mit automatischer Nährwertberechnung',
      benefit: 'LMIV-Compliance ohne manuellen Aufwand'
    },
    {
      icon: <Printer className="w-8 h-8 text-blue-600" />,
      title: 'Speiseplandruck',
      description: 'Professioneller Druck mit Allergenkennzeichnung',
      benefit: 'Rechtssichere Kennzeichnung automatisch'
    },
    {
      icon: <Package className="w-8 h-8 text-purple-600" />,
      title: 'Warenwirtschaft',
      description: 'Lager, Disposition, Lieferantenintegration',
      benefit: 'Keine Überbestände, optimierte Einkaufsmengen'
    },
    {
      icon: <Euro className="w-8 h-8 text-orange-600" />,
      title: 'Controlling & Fibu',
      description: 'DATEV-Schnittstelle, Kostenstellen, Budgets',
      benefit: 'Automatische Buchungen, transparente Kosten'
    }
  ]

  const modules = [
    { name: 'Rezeptverwaltung', preis: '€89/Monat', features: ['LMIV-Nährwerte', 'Allergene', 'Portionskalierung'] },
    { name: 'Speiseplan-Druck', preis: '€69/Monat', features: ['Professional Templates', 'Allergenkennzeichnung', 'Multi-Standort'] },
    { name: 'Warenwirtschaft', preis: '€149/Monat', features: ['Lager-Management', 'Lieferanten-Integration', 'Disposition'] },
    { name: 'Controlling', preis: '€99/Monat', features: ['DATEV-Export', 'Kostenstellen', 'Budget-Controlling'] }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navigation />
      
      {/* Hero */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-green-100 text-green-800 px-4 py-2">
            <Building className="w-4 h-4 mr-2" />
            Professionelle Warenwirtschaft
          </Badge>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            KüchenManager - Warenwirtschaft für Profis
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            <strong>Modulares System für GV & Catering:</strong> Rezepte mit EU-konformen Nährwerten, 
            Speiseplandruck mit Allergenen, Warenwirtschaft mit DATEV-Integration.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="ihre@unternehmen.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-w-64"
              />
              <Button 
                onClick={handleDemoRequest}
                className="bg-green-600 hover:bg-green-700 px-8"
                disabled={!email}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Kostenlose Demo
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">LMIV</div>
              <div className="text-sm text-gray-600">EU-konform</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">DATEV</div>
              <div className="text-sm text-gray-600">Integration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Modular</div>
              <div className="text-sm text-gray-600">Nach Bedarf</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">500+</div>
              <div className="text-sm text-gray-600">Profi-Küchen</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Alles für professionelle Küchenverwaltung
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {feature.icon}
                    <div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      {feature.benefit}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Modules */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Modulare Preisgestaltung
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Wählen Sie nur die Module, die Sie brauchen. Jederzeit erweiterbar.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {modules.map((modul, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{modul.name}</CardTitle>
                  <div className="text-2xl font-bold text-green-600">{modul.preis}</div>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {modul.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button className="bg-green-600 hover:bg-green-700 px-8 py-3">
              Individuelle Konfiguration anfragen
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Starten Sie noch heute mit KüchenManager
          </h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Kostenlose Demo mit Ihren echten Daten. Siehe sofort wie KüchenManager 
            Ihre Küchenverwaltung vereinfacht.
          </p>
          <Button 
            onClick={handleDemoRequest}
            className="bg-white text-green-600 hover:bg-green-50 px-8 py-3"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Demo vereinbaren - kostenlos & unverbindlich
          </Button>
        </div>
      </section>
    </div>
  )
}