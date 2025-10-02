'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/navigation"
import { Plus, Download, Edit, Trash2, Save } from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  description: string
  price: string
  category: string
}

interface MenuCard {
  id: string
  name: string
  template: string
  items: MenuItem[]
}

export default function SpeisekartenDesignerPage() {
  const router = useRouter()
  const [menuCards, setMenuCards] = useState<MenuCard[]>([])
  const [selectedCard, setSelectedCard] = useState<MenuCard | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newCardName, setNewCardName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('modern')

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login?redirect=/speisekarten-designer')
    }

    // Load saved menu cards from localStorage
    const savedCards = localStorage.getItem('menuCards')
    if (savedCards) {
      setMenuCards(JSON.parse(savedCards))
    }
  }, [router])

  // Save to localStorage whenever menu cards change
  useEffect(() => {
    if (menuCards.length > 0) {
      localStorage.setItem('menuCards', JSON.stringify(menuCards))
    }
  }, [menuCards])

  const createNewCard = () => {
    if (!newCardName) return

    const newCard: MenuCard = {
      id: Date.now().toString(),
      name: newCardName,
      template: selectedTemplate,
      items: []
    }

    setMenuCards([...menuCards, newCard])
    setSelectedCard(newCard)
    setNewCardName('')
    setIsCreating(false)
  }

  const addMenuItem = (category: string) => {
    if (!selectedCard) return

    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: '',
      category
    }

    const updatedCard = {
      ...selectedCard,
      items: [...selectedCard.items, newItem]
    }

    setSelectedCard(updatedCard)
    updateMenuCard(updatedCard)
  }

  const updateMenuItem = (itemId: string, field: keyof MenuItem, value: string) => {
    if (!selectedCard) return

    const updatedItems = selectedCard.items.map(item =>
      item.id === itemId ? { ...item, [field]: value } : item
    )

    const updatedCard = {
      ...selectedCard,
      items: updatedItems
    }

    setSelectedCard(updatedCard)
    updateMenuCard(updatedCard)
  }

  const deleteMenuItem = (itemId: string) => {
    if (!selectedCard) return

    const updatedCard = {
      ...selectedCard,
      items: selectedCard.items.filter(item => item.id !== itemId)
    }

    setSelectedCard(updatedCard)
    updateMenuCard(updatedCard)
  }

  const updateMenuCard = (card: MenuCard) => {
    setMenuCards(menuCards.map(c => c.id === card.id ? card : c))
  }

  const deleteMenuCard = (cardId: string) => {
    setMenuCards(menuCards.filter(c => c.id !== cardId))
    if (selectedCard?.id === cardId) {
      setSelectedCard(null)
    }
  }

  const exportPDF = () => {
    if (!selectedCard) return

    // Create text content for download
    let content = `${selectedCard.name}\n${'='.repeat(50)}\n\n`

    const categories = ['Vorspeisen', 'Hauptgerichte', 'Desserts', 'Getränke']

    categories.forEach(category => {
      const items = selectedCard.items.filter(item => item.category === category)
      if (items.length > 0) {
        content += `\n${category}\n${'-'.repeat(30)}\n`
        items.forEach(item => {
          if (item.name) {
            content += `\n${item.name} - ${item.price}€\n`
            if (item.description) {
              content += `${item.description}\n`
            }
          }
        })
      }
    })

    // Create download
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedCard.name.replace(/\s+/g, '_')}_menu.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const createSampleMenu = () => {
    const sampleCard: MenuCard = {
      id: 'sample-' + Date.now(),
      name: 'Beispiel Restaurant Menü',
      template: 'elegant',
      items: [
        { id: '1', name: 'Caesar Salad', description: 'Knackiger Römersalat mit Parmesan', price: '8.90', category: 'Vorspeisen' },
        { id: '2', name: 'Bruschetta', description: 'Geröstetes Brot mit Tomaten', price: '6.50', category: 'Vorspeisen' },
        { id: '3', name: 'Wiener Schnitzel', description: 'Mit Pommes und Salat', price: '18.90', category: 'Hauptgerichte' },
        { id: '4', name: 'Lachsfilet', description: 'Auf Spinatbett mit Reis', price: '22.50', category: 'Hauptgerichte' },
        { id: '5', name: 'Tiramisu', description: 'Hausgemacht nach Originalrezept', price: '6.90', category: 'Desserts' }
      ]
    }

    setMenuCards([...menuCards, sampleCard])
    setSelectedCard(sampleCard)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Speisekarten Designer</h1>
          <p className="text-gray-600">Erstellen Sie professionelle Speisekarten mit schönen Vorlagen</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📄</span> Speisekarten ({menuCards.length})
                </CardTitle>
                <CardDescription>Ihre Speisekarten-Sammlung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {!isCreating ? (
                  <>
                    {menuCards.map(card => (
                      <div
                        key={card.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedCard?.id === card.id ? 'bg-purple-50 border-purple-300' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedCard(card)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{card.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteMenuCard(card.id)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button
                      className="w-full mt-4"
                      onClick={() => setIsCreating(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Neue Karte erstellen
                    </Button>

                    {menuCards.length === 0 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={createSampleMenu}
                      >
                        Beispielmenü erstellen
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <Label>Kartenname</Label>
                    <Input
                      value={newCardName}
                      onChange={(e) => setNewCardName(e.target.value)}
                      placeholder="z.B. Sommermenü 2024"
                    />

                    <Label>Vorlage</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                    >
                      <option value="modern">Modern Minimal</option>
                      <option value="classic">Klassisch Elegant</option>
                      <option value="rustic">Rustikaler Charme</option>
                      <option value="fine">Gehobene Küche</option>
                    </select>

                    <div className="flex gap-2">
                      <Button onClick={createNewCard} disabled={!newCardName}>
                        Erstellen
                      </Button>
                      <Button variant="outline" onClick={() => setIsCreating(false)}>
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedCard ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{selectedCard.name}</CardTitle>
                    <Button onClick={exportPDF}>
                      <Download className="w-4 h-4 mr-2" />
                      PDF exportieren
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {['Vorspeisen', 'Hauptgerichte', 'Desserts', 'Getränke'].map(category => (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">{category}</h3>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addMenuItem(category)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Artikel hinzufügen
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {selectedCard.items
                            .filter(item => item.category === category)
                            .map(item => (
                              <div key={item.id} className="p-4 border rounded-lg bg-white">
                                <div className="grid md:grid-cols-3 gap-3">
                                  <Input
                                    placeholder="Name"
                                    value={item.name}
                                    onChange={(e) => updateMenuItem(item.id, 'name', e.target.value)}
                                  />
                                  <Input
                                    placeholder="Beschreibung"
                                    value={item.description}
                                    onChange={(e) => updateMenuItem(item.id, 'description', e.target.value)}
                                  />
                                  <div className="flex gap-2">
                                    <Input
                                      placeholder="Preis"
                                      value={item.price}
                                      onChange={(e) => updateMenuItem(item.id, 'price', e.target.value)}
                                    />
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => deleteMenuItem(item.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-96 text-gray-500">
                  <span className="text-6xl mb-4">📄</span>
                  <p>Wählen Sie eine Speisekarte links aus, um mit der Bearbeitung zu beginnen</p>
                  {menuCards.length === 0 && (
                    <Button
                      className="mt-4"
                      onClick={createSampleMenu}
                    >
                      Beispielmenü erstellen zum Starten
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}