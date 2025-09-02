'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import { useLanguage } from "@/contexts/LanguageContext"
import { BarChart, Plus, Euro, TrendingUp, Calendar } from "lucide-react"

interface CostEntry {
  id: string
  product: string
  category: string
  amount: number
  unit: string
  unitPrice: number
  totalPrice: number
  supplier: string
  date: string
}

export default function KostenkontrollePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [entries, setEntries] = useState<CostEntry[]>([])
  const [newEntry, setNewEntry] = useState({
    product: '',
    category: '',
    amount: 1,
    unit: 'kg',
    unitPrice: 0,
    supplier: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login?redirect=/kostenkontrolle')
      return
    }
  }, [router])

  const addEntry = () => {
    if (!newEntry.product || !newEntry.category || newEntry.unitPrice <= 0) {
      alert('Please fill all required fields')
      return
    }

    const entry: CostEntry = {
      id: Date.now().toString(),
      ...newEntry,
      totalPrice: newEntry.amount * newEntry.unitPrice
    }

    setEntries([...entries, entry])
    
    // Reset form
    setNewEntry({
      product: '',
      category: '',
      amount: 1,
      unit: 'kg',
      unitPrice: 0,
      supplier: '',
      date: new Date().toISOString().split('T')[0]
    })
  }

  const totalCosts = entries.reduce((sum, entry) => sum + entry.totalPrice, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Cost Control
            </h1>
            <p className="text-xl text-gray-600">
              Keep track of your food costs and analyze spending trends
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Add Cost Entry
                </CardTitle>
                <CardDescription>
                  Record a new expense entry
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Product Name</Label>
                  <Input
                    value={newEntry.product}
                    onChange={(e) => setNewEntry({...newEntry, product: e.target.value})}
                    placeholder="e.g., Tomatoes, Beef, Olive Oil"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Category</Label>
                    <Select value={newEntry.category} onValueChange={(value) => setNewEntry({...newEntry, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vegetables">Vegetables</SelectItem>
                        <SelectItem value="meat">Meat & Fish</SelectItem>
                        <SelectItem value="dairy">Dairy</SelectItem>
                        <SelectItem value="grains">Grains</SelectItem>
                        <SelectItem value="spices">Spices</SelectItem>
                        <SelectItem value="beverages">Beverages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Supplier</Label>
                    <Input
                      value={newEntry.supplier}
                      onChange={(e) => setNewEntry({...newEntry, supplier: e.target.value})}
                      placeholder="Supplier name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={newEntry.amount}
                      onChange={(e) => setNewEntry({...newEntry, amount: parseFloat(e.target.value) || 0})}
                      placeholder="1"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Select value={newEntry.unit} onValueChange={(value) => setNewEntry({...newEntry, unit: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="l">l</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="pcs">pcs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Unit Price (€)</Label>
                    <Input
                      type="number"
                      value={newEntry.unitPrice}
                      onChange={(e) => setNewEntry({...newEntry, unitPrice: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                  />
                </div>

                <Button onClick={addEntry} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-blue-600" />
                  Cost Overview
                </CardTitle>
                <CardDescription>
                  Your spending summary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Euro className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">Total Costs</span>
                    </div>
                    <span className="text-xl font-bold text-blue-700">
                      €{totalCosts.toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Recent Entries</h3>
                    {entries.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No entries yet. Add your first cost entry above.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {entries.slice(-5).reverse().map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <div className="font-medium">{entry.product}</div>
                              <div className="text-sm text-gray-600">
                                {entry.amount}{entry.unit} • {entry.category}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">€{entry.totalPrice.toFixed(2)}</div>
                              <div className="text-sm text-gray-600">{entry.date}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}