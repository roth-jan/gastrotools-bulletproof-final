'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { useLanguage } from "@/contexts/LanguageContext"
import { Calculator, FileText, Calendar, Package, BarChart, Users } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  company?: string
  plan: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }

    try {
      setUser(JSON.parse(userData))
    } catch (error) {
      console.error('Failed to parse user data:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">{t('common.loading')}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tools = [
    {
      name: t('nav.nutrition'),
      description: 'EU-compliant nutrition calculation with USDA integration',
      icon: Calculator,
      href: '/naehrwertrechner',
      color: 'purple'
    },
    {
      name: t('nav.cost'),
      description: 'Track expenses, budgets and analyze cost trends',
      icon: BarChart,
      href: '/kostenkontrolle', 
      color: 'blue'
    },
    {
      name: t('nav.inventory'),
      description: 'Manage stock levels with automated alerts',
      icon: Package,
      href: '/lagerverwaltung',
      color: 'green'
    },
    {
      name: t('nav.menu'),
      description: 'Plan weekly menus with cost calculations',
      icon: Calendar,
      href: '/menueplaner',
      color: 'orange'
    },
    {
      name: t('nav.cards'),
      description: 'Design professional menu cards',
      icon: FileText,
      href: '/speisekarten-designer',
      color: 'pink'
    },
    {
      name: 'Admin Dashboard',
      description: 'Manage users, leads and system monitoring',
      icon: Users,
      href: '/admin',
      color: 'indigo'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('dashboard.welcome')}, {user?.name || user?.email}!
            </h1>
            <p className="text-xl text-gray-600">
              Choose a tool to get started with your restaurant management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link key={tool.href} href={tool.href}>
                <Card className="glass card-hover cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-${tool.color}-100 flex items-center justify-center`}>
                        <tool.icon className={`w-6 h-6 text-${tool.color}-600`} />
                      </div>
                      {tool.name}
                    </CardTitle>
                    <CardDescription>
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Open Tool
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}