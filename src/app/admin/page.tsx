'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { useLanguage } from "@/contexts/LanguageContext"
import { Users, Activity, TrendingUp, Settings, Eye, Mail } from "lucide-react"

interface AdminStats {
  totalUsers: number
  totalLeads: number
  monthlySignups: number
  activeUsers: number
}

interface Lead {
  id: string
  name: string
  email: string
  company: string
  toolInterest: string
  status: string
  createdAt: string
}

export default function AdminPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalLeads: 0,
    monthlySignups: 0,
    activeUsers: 0
  })
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null) // ADDED: Lead detail modal

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }

    // Demo data for admin
    setStats({
      totalUsers: 45,
      totalLeads: 12,
      monthlySignups: 8,
      activeUsers: 23
    })

    setLeads([
      {
        id: '1',
        name: 'Restaurant Milano',
        email: 'info@milano.de',
        company: 'Milano Restaurant',
        toolInterest: 'naehrwertrechner',
        status: 'new',
        createdAt: '2024-08-27'
      },
      {
        id: '2',
        name: 'Café Zentral',
        email: 'contact@zentral.com',
        company: 'Café Zentral GmbH',
        toolInterest: 'speisekarten',
        status: 'contacted',
        createdAt: '2024-08-26'
      }
    ])

    setLoading(false)
  }, [router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'  
      case 'qualified': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading admin dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Admin Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Monitor system performance and manage leads
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Leads</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
                  </div>
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Signups</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.monthlySignups}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                  </div>
                  <Activity className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leads Management */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-600" />
                Lead Management ({leads.length})
              </CardTitle>
              <CardDescription>
                Manage customer leads and conversion tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leads.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No leads yet
                </p>
              ) : (
                <div className="space-y-4">
                  {leads.map(lead => (
                    <div key={lead.id} className="flex items-center justify-between p-4 bg-white rounded border">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-semibold">{lead.name}</div>
                            <div className="text-sm text-gray-600">{lead.email}</div>
                            <div className="text-sm text-gray-600">{lead.company}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Interested in</div>
                          <div className="font-medium">{lead.toolInterest}</div>
                          <div className="text-xs text-gray-500">{lead.createdAt}</div>
                        </div>
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* ADDED: Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Lead Details</h3>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Name</label>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <p className="font-medium">{selectedLead.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Company</label>
                  <p className="font-medium">{selectedLead.company || 'Not specified'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Tool Interest</label>
                  <p className="font-medium">{selectedLead.toolInterest}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Status</label>
                  <Badge className={getStatusColor(selectedLead.status)}>
                    {selectedLead.status}
                  </Badge>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Created</label>
                  <p className="font-medium">{selectedLead.createdAt}</p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button
                  className="flex-1"
                  onClick={() => {
                    // Mark as contacted
                    setLeads(prev => prev.map(lead =>
                      lead.id === selectedLead.id 
                        ? { ...lead, status: 'contacted' }
                        : lead
                    ))
                    setSelectedLead(null)
                    console.log(`✅ Marked lead ${selectedLead.name} as contacted`)
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Mark Contacted
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setSelectedLead(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}