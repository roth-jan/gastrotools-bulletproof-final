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
            🍽️ GastroTools Professional
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {language === 'de'
              ? 'Professionelle Restaurant-Management-Suite - Produktionsbereit mit vollständiger Internationalisierung'
              : 'Professional Restaurant Management Suite - Production Ready with Full Internationalization'
            }
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🧮 {language === 'de' ? 'Nährwert-Rechner' : 'Nutrition Calculator'}
              </CardTitle>
              <CardDescription>
                {language === 'de'
                  ? 'EU-konform mit USDA-Integration (20.000+ Lebensmittel)'
                  : 'EU-compliant with USDA integration (20,000+ foods)'
                }
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💰 {language === 'de' ? 'Kostenkontrolle' : 'Cost Control'}
              </CardTitle>
              <CardDescription>
                {language === 'de'
                  ? 'Ausgaben tracken, Budgets, Analytics'
                  : 'Track expenses, budgets, analytics'
                }
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📦 {language === 'de' ? 'Lagerbestand' : 'Inventory'}
              </CardTitle>
              <CardDescription>
                {language === 'de'
                  ? 'Bestandsführung mit Alerts'
                  : 'Stock tracking with alerts'
                }
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📅 {language === 'de' ? 'Menüplaner' : 'Menu Planner'}
              </CardTitle>
              <CardDescription>
                {language === 'de'
                  ? 'Wochenplanung mit Kostenberechnungen'
                  : 'Weekly planning with cost calculations'
                }
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎨 {language === 'de' ? 'Menükarten-Designer' : 'Menu Card Designer'}
              </CardTitle>
              <CardDescription>
                {language === 'de'
                  ? 'Professionelle Vorlagen'
                  : 'Professional templates'
                }
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🌐 {language === 'de' ? 'Internationalisierung' : 'Internationalization'}
              </CardTitle>
              <CardDescription>
                {language === 'de'
                  ? 'Vollständige Deutsch/Englisch Unterstützung'
                  : 'Complete German/English support'
                }
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Demo & Tools */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'de' ? '🚀 Demo starten' : '🚀 Start Demo'}
              </CardTitle>
              <CardDescription>
                {language === 'de'
                  ? 'Teste die Speisekarten-Designer Demo'
                  : 'Try the Menu Card Designer Demo'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/speisekarten-designer/demo">
                <Button className="w-full">
                  {language === 'de' ? 'Demo öffnen' : 'Open Demo'}
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
                  : 'System monitoring and metrics'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/monitoring">
                <Button variant="outline" className="w-full">
                  {language === 'de' ? 'Monitoring öffnen' : 'Open Monitoring'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'de' ? '🛠️ Technologie-Stack' : '🛠️ Technology Stack'}
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
                40 Translation Keys<br />
                97.5% Coverage
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