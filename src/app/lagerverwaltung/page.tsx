'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { useLanguage } from "@/contexts/LanguageContext"
import { Package, Plus, Search, AlertTriangle } from "lucide-react"

interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  minStock: number
  maxStock?: number
  location: string
  expiryDate?: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
}

export default function LagerverwaltungPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: 'kg',
    minStock: 1,
    maxStock: 100,
    location: '',
    expiryDate: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login?redirect=/lagerverwaltung')
      return
    }
  }, [router])

  const getStockStatus = (quantity: number, minStock: number): 'in_stock' | 'low_stock' | 'out_of_stock' => {
    if (quantity === 0) return 'out_of_stock'
    if (quantity <= minStock) return 'low_stock'
    return 'in_stock'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800'
      case 'low_stock': return 'bg-yellow-100 text-yellow-800'
      case 'out_of_stock': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const addItem = () => {
    if (!newItem.name || !newItem.category) {
      alert('Please fill in name and category')
      return
    }

    const item: InventoryItem = {
      id: Date.now().toString(),
      ...newItem,
      status: getStockStatus(newItem.quantity, newItem.minStock)
    }

    setItems([...items, item])
    
    // Reset form
    setNewItem({
      name: '',
      category: '',
      quantity: 0,
      unit: 'kg',
      minStock: 1,
      maxStock: 100,
      location: '',
      expiryDate: ''
    })
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const lowStockCount = items.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Inventory Management
            </h1>
            <p className="text-xl text-gray-600">
              Manage your stock levels with automated alerts
            </p>
          </div>

          {lowStockCount > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">
                  {lowStockCount} item(s) need restocking
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-600" />
                  Add Inventory Item
                </CardTitle>
                <CardDescription>
                  Add a new item to your inventory
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Product Name</Label>
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="e.g., Fresh Tomatoes, Ground Beef"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Category</Label>
                    <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vegetables">Vegetables</SelectItem>
                        <SelectItem value="meat">Meat & Fish</SelectItem>
                        <SelectItem value="dairy">Dairy</SelectItem>
                        <SelectItem value="grains">Grains & Bread</SelectItem>
                        <SelectItem value="spices">Spices & Herbs</SelectItem>
                        <SelectItem value="beverages">Beverages</SelectItem>
                        <SelectItem value="frozen">Frozen Goods</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Location</Label>
                    <Input
                      value={newItem.location}
                      onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                      placeholder="e.g., Freezer, Pantry"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Current Stock</Label>
                    <Input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Select value={newItem.unit} onValueChange={(value) => setNewItem({...newItem, unit: value})}>
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
                    <Label>Min Stock</Label>
                    <Input
                      type="number"
                      value={newItem.minStock}
                      onChange={(e) => setNewItem({...newItem, minStock: parseFloat(e.target.value) || 0})}
                      placeholder="1"
                      step="0.1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Expiry Date (Optional)</Label>
                  <Input
                    type="date"
                    value={newItem.expiryDate}
                    onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                  />
                </div>

                <Button onClick={addItem} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Inventory
                </Button>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-600" />
                  Inventory Overview ({filteredItems.length} items)
                </CardTitle>
                <CardDescription>
                  Manage your current stock levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search inventory..."
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="vegetables">Vegetables</SelectItem>
                        <SelectItem value="meat">Meat & Fish</SelectItem>
                        <SelectItem value="dairy">Dairy</SelectItem>
                        <SelectItem value="grains">Grains</SelectItem>
                        <SelectItem value="spices">Spices</SelectItem>
                        <SelectItem value="beverages">Beverages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {filteredItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      {items.length === 0 
                        ? "No inventory items yet. Add your first item above."
                        : "No items match your search criteria."
                      }
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded border">
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-600">
                              {item.category} • {item.location}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="font-semibold">
                                {item.quantity} {item.unit}
                              </div>
                              <div className="text-sm text-gray-600">
                                Min: {item.minStock} {item.unit}
                              </div>
                            </div>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status === 'in_stock' ? '✅ In Stock' : 
                               item.status === 'low_stock' ? '⚠️ Low' : 
                               '🚫 Out'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}