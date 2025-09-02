'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/LanguageContext"
import { Calculator, FileText, Calendar, Package, Users, ChefHat } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
              {t('home.title')}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed">
              {t('home.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/register" className="btn-primary">
                {t('home.get_started')}
              </Link>
              <Link href="/login" className="btn-secondary">
                <ChefHat className="w-5 h-5 mr-2" />
                Demo Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Professional Restaurant Tools
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for successful restaurant management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="glass card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-purple-600" />
                  Nutrition Calculator
                </CardTitle>
                <CardDescription>
                  EU-compliant nutrition calculation with USDA database integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ 20,000+ ingredients (USDA)</li>
                  <li>✅ German ingredient recognition</li>
                  <li>✅ EU regulation compliance</li>
                  <li>✅ PDF export</li>
                </ul>
                <Link href="/naehrwertrechner">
                  <Button className="w-full mt-4">Try Tool</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="glass card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Cost Control
                </CardTitle>
                <CardDescription>
                  Track expenses, analyze trends, manage budgets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ Expense tracking</li>
                  <li>✅ Budget analysis</li>
                  <li>✅ Supplier management</li>
                  <li>✅ Cost analytics</li>
                </ul>
                <Link href="/kostenkontrolle">
                  <Button className="w-full mt-4">Try Tool</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="glass card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-6 h-6 text-green-600" />
                  Inventory Management
                </CardTitle>
                <CardDescription>
                  Stock tracking with automated alerts and categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ Stock level alerts</li>
                  <li>✅ Category management</li>
                  <li>✅ Expiry tracking</li>
                  <li>✅ Supplier integration</li>
                </ul>
                <Link href="/lagerverwaltung">
                  <Button className="w-full mt-4">Try Tool</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="glass card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-orange-600" />
                  Menu Planner
                </CardTitle>
                <CardDescription>
                  Weekly menu planning with cost calculations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ Weekly planning</li>
                  <li>✅ Recipe assignment</li>
                  <li>✅ Budget calculations</li>
                  <li>✅ Export functionality</li>
                </ul>
                <Link href="/menueplaner">
                  <Button className="w-full mt-4">Try Tool</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="glass card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-pink-600" />
                  Menu Card Designer
                </CardTitle>
                <CardDescription>
                  Create professional menu cards with templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ Professional templates</li>
                  <li>✅ Custom branding</li>
                  <li>✅ Multi-language support</li>
                  <li>✅ Print-ready export</li>
                </ul>
                <Link href="/speisekarten-designer">
                  <Button className="w-full mt-4">Try Tool</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="glass card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-indigo-600" />
                  Admin Dashboard
                </CardTitle>
                <CardDescription>
                  Monitor usage, manage leads, system analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ User management</li>
                  <li>✅ Lead tracking</li>
                  <li>✅ System monitoring</li>
                  <li>✅ Analytics dashboard</li>
                </ul>
                <Link href="/admin">
                  <Button className="w-full mt-4">Admin Access</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}