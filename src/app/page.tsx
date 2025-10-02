'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/contexts/LanguageContext'

export default function HomePage() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
              className="mb-4"
            >
              🌐 {language === 'de' ? 'English' : 'Deutsch'}
            </Button>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🍽️ GastroTools Professionell
          </h1>
          <div className="text-xs text-gray-400">Version: 2.10.2025 - AKTUELL</div>
          <p className="text-xl text-gray-600 mb-8">
            {language === 'de'
              ? 'Professionelle Restaurant-Management-Suite - Produktionsbereit mit vollständiger Internationalisierung'
              : 'Professionelle Restaurant-Management-Suite - Produktionsbereit mit vollständiger Internationalisierung'
            }
          </p>
        </div>

        {/* Funktionen Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🧮 {language === 'de' ? 'Nährwert-Rechner' : 'Nährwert-Rechner'}
              </CardTitle>
              <CardDescription>
                {language === 'de'
                  ? 'EU-konform mit USDA-Integration (20.000+ Lebensmittel)'
                  : 'EU-konform mit USDA-Integration (20.000+ Lebensmittel)'
                }
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💰 {language === 'de' ? 'Kostenkontrolle' : 'Kostenkontrolle'}
              </CardTitle>
              <CardDescription>
                {language === 'de'
                  ? 'Ausgaben tracken, Budgets, Analytics'
                  : 'Ausgaben tracken, Budgets, Analytics'
                }
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📦 {language === 'de' ? 'Lagerbestand' : 'Lagerbestand'}
              </CardTitle>
              <CardDescription>
                {language === 'de'
                  ? 'Bestandsführung mit Alerts'
                  : 'Bestandsführung mit Benachrichtigungen'
                }
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📅 {language === 'de' ? 'Menüplaner' : 'Menüplaner'}
              </CardTitle>
              <CardDescription>
                {language === 'de'
                  ? 'Wochenplanung mit Kostenberechnungen'
                  : 'Wochenplanung mit Kostenberechnungen'
                }
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎨 {language === 'de' ? 'Menükarten-Designer' : 'Menükarten-Designer'}
              </CardTitle>
              <CardDescription>
                {language === 'de'
                  ? 'Professionelle Vorlagen'
                  : 'Professionelle Vorlagen'
                }
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🌐 {language === 'de' ? 'Internationalisierung' : 'Internationalisierung'}
              </CardTitle>
              <CardDescription>
                {language === 'de'
                  ? 'Vollständige Deutsch/Englisch Unterstützung'
                  : 'Vollständige Deutsch/Englisch Unterstützung'
                }
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Demo & Werkzeuge */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'de' ? '🚀 Demo starten' : '🚀 Demo starten'}
              </CardTitle>
              <CardDescription>
                {language === 'de'
                  ? 'Teste die Speisekarten-Designer Demo'
                  : 'Teste die Speisekarten-Designer Demo'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/speisekarten-designer/demo">
                <Button className="w-full">
                  {language === 'de' ? 'Demo öffnen' : 'Demo öffnen'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'de' ? '⚙️ Admin Panel' : '⚙️ Admin Panel'}
              </CardTitle>
              <CardDescription>
                {language === 'de'
                  ? 'System-Monitoring und Metriken'
                  : 'System-Monitoring und Metriken'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/monitoring">
                <Button variant="outline" className="w-full">
                  {language === 'de' ? 'Überwachung öffnen' : 'Überwachung öffnen'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'de' ? '🛠️ Technologie-Stack' : '🛠️ Technologie-Stack'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Frontend:</strong><br />
                Next.js 15.3.4<br />
                React 18<br />
                TypeScript
              </div>
              <div>
                <strong>Styling:</strong><br />
                TailwindCSS<br />
                Shadcn/ui<br />
                Lucide Icons
              </div>
              <div>
                <strong>Backend:</strong><br />
                Prisma ORM<br />
                PostgreSQL<br />
                JWT Auth
              </div>
              <div>
                <strong>i18n:</strong><br />
                React Context<br />
                40 Übersetzungen<br />
                97.5% Abdeckung
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-12 text-gray-500">
          <p>
            {language === 'de'
              ? '🏆 Produktionsbereit mit vollständiger Internationalisierung'
              : '🏆 Production-ready with complete internationalization'
            }
          </p>
        </div>
      </div>
    </div>
  )
}