'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { BarChart, TrendingUp, Users, Target, Mail, Calendar, ArrowRight } from "lucide-react"

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState({
    totalLeads: 0,
    leadsBySegment: { webmenue: 0, kuechenmanager: 0, ear: 0 },
    leadsByTool: { menueplaner: 0, kostenkontrolle: 0, naehrwert: 0, designer: 0, lager: 0 },
    conversionRates: { leadToDemo: 0, demoToTrial: 0, trialToCustomer: 0 },
    revenueAttribution: { totalMRR: 0, avgDealSize: 0 },
    userBehavior: { avgSessionTime: 0, mostUsedTool: '', exportConversion: 0 }
  })

  useEffect(() => {
    // Simulate analytics data (in real app: fetch from backend)
    const mockData = {
      totalLeads: 1247,
      leadsBySegment: { 
        webmenue: 623, 
        kuechenmanager: 398, 
        ear: 226 
      },
      leadsByTool: { 
        menueplaner: 445, 
        kostenkontrolle: 312, 
        naehrwert: 398, 
        designer: 156, 
        lager: 89 
      },
      conversionRates: { 
        leadToDemo: 23.5, 
        demoToTrial: 67.8, 
        trialToCustomer: 34.2 
      },
      revenueAttribution: { 
        totalMRR: 23450, 
        avgDealSize: 1890 
      },
      userBehavior: { 
        avgSessionTime: 8.5, 
        mostUsedTool: 'naehrwertrechner', 
        exportConversion: 18.9 
      }
    }
    
    setAnalytics(mockData)
  }, [])

  const topPerformingTools = Object.entries(analytics.leadsByTool)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  const segmentROI = [
    { segment: 'WebMenü', leads: analytics.leadsBySegment.webmenue, avgDeal: 2100, roi: '420%' },
    { segment: 'KüchenManager', leads: analytics.leadsBySegment.kuechenmanager, avgDeal: 1680, roi: '385%' },
    { segment: 'EAR', leads: analytics.leadsBySegment.ear, avgDeal: 1950, roi: '445%' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GastroTools Lead-Analytics
          </h1>
          <p className="text-gray-600">
            Business Case Performance Dashboard
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="w-5 h-5 mr-2" />
                Total Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{analytics.totalLeads}</div>
              <p className="text-sm text-gray-600">+23% vs. Vormonat</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Target className="w-5 h-5 mr-2" />
                Lead → Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{analytics.conversionRates.leadToDemo}%</div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="w-5 h-5 mr-2" />
                MRR Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">€{analytics.revenueAttribution.totalMRR.toLocaleString()}</div>
              <p className="text-sm text-gray-600">Monthly Recurring Revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Mail className="w-5 h-5 mr-2" />
                Export → Lead
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{analytics.userBehavior.exportConversion}%</div>
              <p className="text-sm text-gray-600">Export Conversion</p>
            </CardContent>
          </Card>
        </div>

        {/* Segment Performance */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Lead-Generation by Segment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {segmentROI.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-semibold">{segment.segment}</div>
                      <div className="text-sm text-gray-600">{segment.leads} Leads</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">€{segment.avgDeal}</div>
                      <Badge className="bg-green-100 text-green-800">{segment.roi} ROI</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformingTools.map(([tool, leads], index) => (
                  <div key={tool} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="font-medium capitalize">{tool}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{leads} Leads</div>
                      <div className="text-sm text-gray-600">
                        {Math.round((leads / analytics.totalLeads) * 100)}% Share
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Funnel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Lead-to-Customer Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold">{analytics.totalLeads}</div>
                <div className="text-sm text-gray-600">Leads Generated</div>
              </div>
              
              <div className="text-center">
                <ArrowRight className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold">{Math.round(analytics.totalLeads * analytics.conversionRates.leadToDemo / 100)}</div>
                <div className="text-sm text-gray-600">Demos Booked</div>
                <Badge className="mt-1 bg-green-100 text-green-800">{analytics.conversionRates.leadToDemo}%</Badge>
              </div>
              
              <div className="text-center">
                <ArrowRight className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-2xl font-bold">{Math.round(analytics.totalLeads * analytics.conversionRates.leadToDemo * analytics.conversionRates.demoToTrial / 10000)}</div>
                <div className="text-sm text-gray-600">Trials Started</div>
                <Badge className="mt-1 bg-purple-100 text-purple-800">{analytics.conversionRates.demoToTrial}%</Badge>
              </div>
              
              <div className="text-center">
                <ArrowRight className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-2xl font-bold">{Math.round(analytics.totalLeads * analytics.conversionRates.leadToDemo * analytics.conversionRates.demoToTrial * analytics.conversionRates.trialToCustomer / 1000000)}</div>
                <div className="text-sm text-gray-600">Customers</div>
                <Badge className="mt-1 bg-orange-100 text-orange-800">{analytics.conversionRates.trialToCustomer}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Case Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Business Case Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">€{(analytics.revenueAttribution.totalMRR * 12).toLocaleString()}</div>
                <div className="text-sm text-blue-800">Annual Recurring Revenue</div>
                <div className="text-xs text-gray-600 mt-2">Projected based on current MRR</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">€{analytics.revenueAttribution.avgDealSize}</div>
                <div className="text-sm text-green-800">Average Deal Size</div>
                <div className="text-xs text-gray-600 mt-2">Per customer first year</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{((analytics.revenueAttribution.avgDealSize * 0.3) / 50).toFixed(1)}x</div>
                <div className="text-sm text-purple-800">ROI Multiple</div>
                <div className="text-xs text-gray-600 mt-2">Revenue vs. GastroTools costs</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">🎯 Business Case Validated</h3>
              <p className="text-sm text-yellow-800">
                GastroTools Freeware → SaaS Pipeline generiert <strong>€{analytics.revenueAttribution.totalMRR.toLocaleString()} MRR</strong> 
                mit <strong>{analytics.conversionRates.leadToDemo}% Lead-to-Demo</strong> Conversion. 
                ROI: <strong>{((analytics.revenueAttribution.avgDealSize * 0.3) / 50).toFixed(1)}x</strong> return on freeware investment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}