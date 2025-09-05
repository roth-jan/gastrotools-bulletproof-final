'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { leadTracker } from "@/lib/lead-tracking"
import { Truck, MapPin, FileText, CreditCard, Database, ArrowRight, CheckCircle, Calendar, Heart } from "lucide-react"

export default function EARLanding() {
  const [email, setEmail] = useState('')
  const [selectedPaket, setSelectedPaket] = useState('')

  const handleStarterpaketInterest = async (paketName: string) => {
    setSelectedPaket(paketName)
    
    await leadTracker.track({
      event: 'starterpaket_interest',
      timestamp: '',
      sessionId: '',
      properties: {
        product: 'ear',
        paket: paketName,
        email
      }
    })

    if (email) {
      alert(`✅ Interesse an ${paketName} registriert! Detaillierte Infos folgen per E-Mail.`)
    } else {
      alert('Bitte geben Sie Ihre E-Mail ein für detaillierte Paket-Informationen.')
    }
  }

  const features = [
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: 'Kundenverwaltung',
      description: 'Senioren, Angehörige, Betreuer - alle Rollen verwalten'
    },
    {
      icon: <MapPin className="w-8 h-8 text-blue-600" />,
      title: 'Tourenplanung', 
      description: 'Optimierte Routen, Etiketten, Kommissionierlisten'
    },
    {
      icon: <FileText className="w-8 h-8 text-green-600" />,
      title: 'Rechnungen & Export',
      description: 'DATEV-Export, SEPA-Lastschrift, Controlling'
    },
    {
      icon: <Database className="w-8 h-8 text-purple-600" />,
      title: 'Web-Shop Integration',
      description: 'Online-Bestellungen für Angehörige'
    }
  ]

  const starterpakete = [
    {
      name: 'Starter S',
      preis: '€99',
      zeitraum: '/Monat',
      popular: false,
      features: [
        '✅ Bis 50 Kunden',
        '✅ Basis-Tourenplanung', 
        '✅ Etiketten-Druck',
        '✅ Einfache Rechnungen',
        '❌ DATEV-Export',
        '❌ Web-Shop'
      ]
    },
    {
      name: 'Professional M',
      preis: '€199', 
      zeitraum: '/Monat',
      popular: true,
      features: [
        '✅ Bis 200 Kunden',
        '✅ Erweiterte Touren',
        '✅ DATEV-Export',
        '✅ SEPA-Lastschrift',
        '✅ Controlling',
        '❌ Web-Shop'
      ]
    },
    {
      name: 'Enterprise L',
      preis: '€299',
      zeitraum: '/Monat', 
      popular: false,
      features: [
        '✅ Unlimited Kunden',
        '✅ Vollständige Touren',
        '✅ DATEV + SAP',
        '✅ Web-Shop Integration',
        '✅ Multi-Mandant',
        '✅ Priority Support'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <Navigation />
      
      {/* Hero */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-red-100 text-red-800 px-4 py-2">
            <Truck className="w-4 h-4 mr-2" />
            Lieferservice-Software
          </Badge>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            EAR - Essen auf Rädern Digital
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            <strong>End-to-End Lösung für Menübringdienste:</strong> Von der Bestellung über 
            Tourenplanung bis DATEV-Export. Alles in einem System.
          </p>

          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">1 Tag</div>
              <div className="text-sm text-gray-600">Setup</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">DATEV</div>
              <div className="text-sm text-gray-600">Ready</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">SEPA</div>
              <div className="text-sm text-gray-600">Integration</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Alles für erfolgreiche Lieferdienste
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                  <div className="bg-blue-50 p-2 rounded text-xs text-blue-800">
                    💡 {feature.benefit}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Starterpakete */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            EAR Starterpakete - Sofort einsatzbereit
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Transparente Preise, keine Setup-Kosten, jederzeit kündbar
          </p>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {starterpakete.map((paket, index) => (
              <Card key={index} className={`relative hover:shadow-xl transition-shadow ${paket.popular ? 'border-2 border-orange-500' : ''}`}>
                {paket.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white">
                    Beliebtestes Paket
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{paket.name}</CardTitle>
                  <div className="text-3xl font-bold text-gray-900">
                    {paket.preis}<span className="text-lg text-gray-500">{paket.zeitraum}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {paket.features.map((feature, i) => (
                      <li key={i} className="text-sm">
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleStarterpaketInterest(paket.name)}
                    className={`w-full ${paket.popular ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                  >
                    {paket.name} wählen
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Alle Pakete enthalten: Einrichtung, Schulung, 30 Tage kostenlos testen
            </p>
            
            <div className="flex gap-2 justify-center">
              <Input
                type="email"
                placeholder="ihre@lieferservice.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="max-w-64"
              />
              <Button 
                onClick={handleStarterpaketInterest}
                className="bg-red-600 hover:bg-red-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Paket-Beratung
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}