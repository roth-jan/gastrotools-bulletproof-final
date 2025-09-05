'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { leadTracker } from "@/lib/lead-tracking"
import { School, Smartphone, CreditCard, GraduationCap, BarChart, ArrowRight, CheckCircle, Calendar } from "lucide-react"

export default function WebMenueLanding() {
  const [email, setEmail] = useState('')
  const [demosBooked, setDemosBooked] = useState(0)

  const handleDemoBooking = async () => {
    await leadTracker.track({
      event: 'demo_requested',
      timestamp: '',
      sessionId: '',
      properties: {
        product: 'webmenue',
        source: 'landing_page',
        email
      }
    })
    
    setDemosBooked(prev => prev + 1)
    alert('🎉 Demo-Anfrage gesendet! Sie erhalten eine Terminbestätigung per E-Mail.')
  }

  const benefits = [
    {
      icon: <Smartphone className="w-8 h-8 text-blue-600" />,
      title: 'Online-Bestellung',
      description: 'Eltern & Schüler bestellen bequem online oder per App',
      detail: 'iOS & Android Apps, Responsive Website, QR-Code-Bestellung'
    },
    {
      icon: <CreditCard className="w-8 h-8 text-green-600" />,
      title: 'Bargeldlose Abrechnung', 
      description: 'SEPA, Guthaben, Überweisung - keine Bargeld-Verwaltung',
      detail: 'Automatische Abbuchung, Guthaben-Management, Eltern-Portal'
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-purple-600" />,
      title: 'BuT-Abrechnung',
      description: 'Bildungs- und Teilhabepaket automatisch abrechnen',
      detail: 'Automatische BuT-Erkennung, Förderung-Abwicklung, Compliance'
    },
    {
      icon: <BarChart className="w-8 h-8 text-orange-600" />,
      title: 'Warenwirtschaft-Integration',
      description: 'Exakte Bedarfsmengen, weniger Food-Waste',
      detail: 'ERP-Integration, Bestellmengen-Prognose, Lager-Optimierung'
    }
  ]

  const customers = [
    'Grundschule Musterstadt (450 Schüler)',
    'Kita Sonnenschein (120 Kinder)', 
    'Betriebskantine TechCorp (800 Mitarbeiter)',
    'Gymnasium Nord (950 Schüler)'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 px-4 py-2">
            <School className="w-4 h-4 mr-2" />
            Digitale Schul- & Kitaverpflegung
          </Badge>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            WebMenü - Online-Bestellung für Schulen & Kitas
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Schluss mit Bargeld-Verwaltung! Eltern bestellen online, BuT-Abrechnung läuft automatisch, 
            Ihre Küche erhält exakte Bedarfsmengen. <strong>Weniger Aufwand, mehr Kontrolle.</strong>
          </p>

          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">15min</div>
              <div className="text-sm text-gray-600">Setup-Zeit</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">0€</div>
              <div className="text-sm text-gray-600">Einrichtung</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">100+</div>
              <div className="text-sm text-gray-600">Zufriedene Schulen</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="ihre@schule.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-w-64"
              />
              <Button 
                onClick={handleDemoBooking}
                className="bg-blue-600 hover:bg-blue-700 px-8"
                disabled={!email}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Kostenlose Demo
              </Button>
            </div>
          </div>
          
          {demosBooked > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg inline-block">
              <CheckCircle className="w-5 h-5 text-green-600 inline mr-2" />
              Demo-Anfrage eingegangen! Terminbestätigung folgt per E-Mail.
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            So digitalisieren erfolgreiche Schulen ihre Mensaverpflegung
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4">
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{benefit.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Vertrauen von 100+ Bildungseinrichtungen
          </h2>
          <p className="text-gray-600 mb-8">
            Von der Grundschule bis zur Betriebskantine - WebMenü bewährt sich täglich
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {customers.map((customer, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm border">
                <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">{customer}</p>
              </div>
            ))}
          </div>

          <div className="bg-blue-600 text-white p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-4">Bereit für die Digitalisierung?</h3>
            <p className="text-blue-100 mb-6">
              Kostenlose Demo vereinbaren - siehe WebMenü live in Aktion mit Ihren Daten
            </p>
            <Button 
              onClick={handleDemoBooking}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Jetzt Demo buchen
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}