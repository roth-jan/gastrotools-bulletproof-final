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

    const updatedCard = {
      ...selectedCard,
      categories: [...selectedCard.categories, category]
    }

    setSelectedCard(updatedCard)
    setMenuCards(prev => prev.map(card => 
      card.id === selectedCard.id ? updatedCard : card
    ))
    setNewCategory({ name: '', items: [] })
  }

  const addMenuItem = (categoryId: string) => {
    if (!selectedCard || !newMenuItem.name) {
      alert('Please enter an item name')
      return
    }

    const item: MenuItem = {
      id: Date.now().toString(),
      ...newMenuItem
    }

    const updatedCard = {
      ...selectedCard,
      categories: selectedCard.categories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, items: [...cat.items, item] }
          : cat
      )
    }

    setSelectedCard(updatedCard)
    setMenuCards(prev => prev.map(card => 
      card.id === selectedCard.id ? updatedCard : card
    ))
    setNewMenuItem({ name: '', description: '', price: 0, allergens: [] })
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

                <div className="border-t pt-4 space-y-2">
                  {menuCards.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm">
                      No menu cards yet
                    </p>
                  ) : (
                    menuCards.map(card => (
                      <div 
                        key={card.id}
                        onClick={() => setSelectedCard(card)}
                        className={`p-3 rounded border cursor-pointer transition-colors ${
                          selectedCard?.id === card.id 
                            ? 'bg-pink-50 border-pink-300' 
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{card.name}</div>
                            <div className="text-sm text-gray-600">
                              {card.categories.length} categories
                            </div>
                          </div>
                          <Badge variant={card.published ? 'default' : 'secondary'}>
                            {card.published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Menu Editor */}
            <Card className="lg:col-span-2 glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-pink-600" />
                  {selectedCard ? `Editing: ${selectedCard.name}` : 'Menu Editor'}
                </CardTitle>
                <CardDescription>
                  {selectedCard ? 'Add categories and menu items' : 'Select a menu card to edit'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedCard ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Create or select a menu card to start editing
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Add Category */}
                    <div className="border-b pb-4">
                      <h3 className="font-semibold mb-3">Add Category</h3>
                      <div className="flex gap-3">
                        <Input
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                          placeholder="e.g., Appetizers, Main Courses"
                          className="flex-1"
                        />
                        <Button onClick={addCategory}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Categories and Items */}
                    <div className="space-y-6">
                      {selectedCard.categories.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          No categories yet. Add your first category above.
                        </p>
                      ) : (
                        selectedCard.categories.map(category => (
                          <Card key={category.id} className="border-2">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg">{category.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {/* Add Menu Item */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
                                <Input
                                  value={newMenuItem.name}
                                  onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                                  placeholder="Dish name"
                                />
                                <Input
                                  value={newMenuItem.description}
                                  onChange={(e) => setNewMenuItem({...newMenuItem, description: e.target.value})}
                                  placeholder="Description"
                                />
                                <Input
                                  type="number"
                                  value={newMenuItem.price}
                                  onChange={(e) => setNewMenuItem({...newMenuItem, price: parseFloat(e.target.value) || 0})}
                                  placeholder="Price"
                                  step="0.50"
                                />
                                <Button onClick={() => addMenuItem(category.id)} size="sm">
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Menu Items */}
                              <div className="space-y-2">
                                {category.items.map(item => (
                                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
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
                        ))
                      )}
                    </div>

                    {/* Actions */}
                    {selectedCard.categories.length > 0 && (
                      <div className="flex gap-3 pt-4 border-t">
                        <Button variant="outline" className="flex-1">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button className="flex-1">
                          <Download className="w-4 h-4 mr-2" />
                          Export PDF
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}