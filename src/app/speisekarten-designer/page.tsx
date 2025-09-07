'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { useLanguage } from "@/contexts/LanguageContext"
import { SmartUpsellV2 } from "@/components/SmartUpsell-v2"
import { FileText, Plus, Eye, Download, Palette } from "lucide-react"

interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  allergens?: string[]
}

interface MenuCard {
  id: string
  name: string
  template: string
  categories: MenuCategory[]
  published: boolean
  createdAt: string
}

export default function SpeisekartenDesignerPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [menuCards, setMenuCards] = useState<MenuCard[]>([])
  const [selectedCard, setSelectedCard] = useState<MenuCard | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showSmartUpsell, setShowSmartUpsell] = useState(false)
  
  const [newCard, setNewCard] = useState({
    name: '',
    template: 'modern-minimal'
  })

  const [newCategory, setNewCategory] = useState({
    name: '',
    items: [] as MenuItem[]
  })

  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: 0,
    allergens: [] as string[]
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login?redirect=/speisekarten-designer')
      return
    }
    
    // Load user data for smart upselling
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        
        // Enhance demo user with mock data for testing
        if (user.email === 'demo@gastrotools.de') {
          user.company = 'Demo Restaurant GmbH'
          user.role = 'Geschäftsführung'
          user.orgType = 'Restaurant'
        }
        
        setCurrentUser(user)
      } catch (e) {
        console.log('User data parsing error:', e)
      }
    }
  }, [router])

  const templates = [
    { id: 'modern-minimal', name: 'Modern Minimal', description: 'Clean and contemporary design' },
    { id: 'classic-elegant', name: 'Classic Elegant', description: 'Traditional fine dining style' },
    { id: 'rustic-charm', name: 'Rustic Charm', description: 'Warm and welcoming bistro style' },
    { id: 'fast-casual', name: 'Fast Casual', description: 'Quick service restaurant style' }
  ]

  const createNewCard = () => {
    if (!newCard.name) {
      alert('Please enter a menu card name')
      return
    }

    const card: MenuCard = {
      id: Date.now().toString(),
      name: newCard.name,
      template: newCard.template,
      categories: [],
      published: false,
      createdAt: new Date().toISOString().split('T')[0]
    }

    setMenuCards([...menuCards, card])
    setSelectedCard(card)
    setNewCard({ name: '', template: 'modern-minimal' })
  }

  const addCategory = () => {
    if (!selectedCard || !newCategory.name) {
      alert('Please enter a category name')
      return
    }

    const category: MenuCategory = {
      id: Date.now().toString(),
      name: newCategory.name,
      items: []
    }

    setSelectedCard({
      ...selectedCard,
      categories: [...selectedCard.categories, category]
    })

    setMenuCards(prev => prev.map(card => 
      card.id === selectedCard.id 
        ? { ...card, categories: [...card.categories, category] }
        : card
    ))

    setNewCategory({ name: '', items: [] })
  }

  const addMenuItem = (categoryId: string) => {
    if (!selectedCard || !newMenuItem.name || newMenuItem.price <= 0) {
      alert('Please fill in item name and price')
      return
    }

    const item: MenuItem = {
      id: Date.now().toString(),
      ...newMenuItem
    }

    setSelectedCard({
      ...selectedCard,
      categories: selectedCard.categories.map(cat =>
        cat.id === categoryId 
          ? { ...cat, items: [...cat.items, item] }
          : cat
      )
    })

    setMenuCards(prev => prev.map(card => 
      card.id === selectedCard.id
        ? {
            ...card,
            categories: card.categories.map(cat =>
              cat.id === categoryId 
                ? { ...cat, items: [...cat.items, item] }
                : cat
            )
          }
        : card
    ))

    setNewMenuItem({ name: '', description: '', price: 0, allergens: [] })
  }

  const handlePDFExport = async () => {
    if (!selectedCard) return

    try {
      // P0: Real PDF export with proper headers
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menuCard: selectedCard,
          userId: currentUser?.id || 'demo'
        })
      })

      if (response.ok) {
        // Get proper filename from response headers
        const contentDisposition = response.headers.get('Content-Disposition')
        const filename = contentDisposition?.match(/filename="([^"]+)"/)?.[1] || 
                        `MENU_${selectedCard.name.replace(/\s+/g, '-')}_${Date.now()}.pdf`
        
        // Download real PDF
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        console.log(`✅ Real PDF exported: ${filename}`)

        // Trigger Smart Upselling with E2E support
        const upsellDelay = (window as any).E2E_MODE ? 200 : 2000
        setTimeout(() => {
          setShowSmartUpsell(true)
          console.log('🎯 Smart Upsell triggered for:', currentUser?.email || 'unknown')
        }, upsellDelay)

      } else {
        const errorData = await response.json()
        alert(errorData.fallback || 'PDF-Export fehlgeschlagen. Bitte versuchen Sie es erneut.')
      }

    } catch (error) {
      console.error('PDF Export error:', error)
      alert('PDF-Download blockiert oder fehlgeschlagen. Per E-Mail senden?')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Menu Card Designer
            </h1>
            <p className="text-xl text-gray-600">
              Create professional menu cards with beautiful templates
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Menu Cards List */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-pink-600" />
                  Menu Cards ({menuCards.length})
                </CardTitle>
                <CardDescription>
                  Your menu card collection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label>Card Name</Label>
                    <Input
                      value={newCard.name}
                      onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                      placeholder="e.g., Summer Menu 2024"
                    />
                  </div>
                  <div>
                    <Label>Template</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={newCard.template}
                      onChange={(e) => setNewCard({...newCard, template: e.target.value})}
                    >
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={createNewCard} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Card
                  </Button>
                </div>

                {menuCards.length > 0 && (
                  <div className="space-y-2">
                    {menuCards.map((card) => (
                      <button
                        key={card.id}
                        onClick={() => setSelectedCard(card)}
                        className={`w-full text-left p-3 rounded border transition-colors ${
                          selectedCard?.id === card.id 
                            ? 'bg-purple-50 border-purple-200' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">{card.name}</div>
                        <div className="text-sm text-gray-500">
                          {card.categories.length} categories
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Menu Card Editor */}
            <Card className="lg:col-span-2 glass">
              <CardHeader>
                <CardTitle>
                  {selectedCard ? selectedCard.name : 'Select a menu card to edit'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCard ? (
                  <div className="space-y-6">
                    {/* Add Category */}
                    <div>
                      <div className="flex gap-3 mb-4">
                        <Input
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                          placeholder="Category name (e.g., Appetizers)"
                          className="flex-1"
                        />
                        <Button onClick={addCategory}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Category
                        </Button>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="space-y-6">
                      {selectedCard.categories.map((category) => (
                        <Card key={category.id}>
                          <CardHeader>
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {/* Add Menu Item */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <Input
                                value={newMenuItem.name}
                                onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                                placeholder="Item name"
                              />
                              <Input
                                type="number"
                                step="0.01"
                                value={newMenuItem.price}
                                onChange={(e) => setNewMenuItem({...newMenuItem, price: parseFloat(e.target.value) || 0})}
                                placeholder="Price (€)"
                              />
                              <Textarea
                                value={newMenuItem.description}
                                onChange={(e) => setNewMenuItem({...newMenuItem, description: e.target.value})}
                                placeholder="Description"
                                className="col-span-2"
                                rows={2}
                              />
                              <Button 
                                onClick={() => addMenuItem(category.id)}
                                className="col-span-2"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Item
                              </Button>
                            </div>

                            {/* Menu Items */}
                            <div className="space-y-2">
                              {category.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                  <div className="flex-1">
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-gray-600">{item.description}</div>
                                  </div>
                                  <div className="font-semibold text-green-600">
                                    €{item.price.toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Actions */}
                    {selectedCard && (
                      <div className="flex gap-3 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            if (!selectedCard) return
                            const previewWindow = window.open('', '_blank')
                            if (previewWindow) {
                              previewWindow.document.write(`<h1>${selectedCard.name}</h1><p>Menu Preview</p>`)
                              previewWindow.document.close()
                            }
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={handlePDFExport}
                          data-testid="export-pdf-btn"
                          aria-label="Export menu card as PDF"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export PDF
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a menu card from the left to start editing</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Smart Upselling */}
      {showSmartUpsell && currentUser && (
        <SmartUpsellV2
          user={currentUser}
          behavior={{
            toolsUsed: ['speisekarten-designer'],
            exportActions: 1,
            menuItemsPlanned: selectedCard?.categories.length || 0
          }}
          context="pdf_export_success"
          onDismiss={() => setShowSmartUpsell(false)}
          onInterest={(saasProduct: string) => {
            const saasUrls = {
              webmenue: '/webmenue',
              kuechenmanager: '/kuechenmanager', 
              ear: '/essen-auf-raedern'
            }
            window.open(saasUrls[saasProduct as keyof typeof saasUrls], '_blank')
            setShowSmartUpsell(false)
          }}
        />
      )}
    </div>
  )
}