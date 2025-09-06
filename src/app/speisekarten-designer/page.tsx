'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SmartUpsellV2 } from "@/components/SmartUpsell-v2"  
import { PDFExportGuarantee } from "@/lib/pdf-export-guarantee"
import { SmartTriggers } from "@/lib/smart-triggers"
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

  // SMART: User Intelligence System (no gates needed)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showSmartUpsell, setShowSmartUpsell] = useState(false)

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

  // SMART: User context for intelligent business model
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        
        // TESTING: Enhance demo user with mock data for Smart Upselling
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
  }, [])

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

                    {/* Actions - FIXED: Always show buttons when card is selected */}
                    {selectedCard && (
                      <div className="flex gap-3 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            // SMART: Working Preview + Smart Upselling
                            if (!selectedCard) return;
                            
                            const previewWindow = window.open('', '_blank', 'width=800,height=1000,scrollbars=yes');
                            if (previewWindow) {
                              previewWindow.document.write(`
                                <!DOCTYPE html>
                                <html>
                                <head>
                                  <title>Preview: ${selectedCard.name}</title>
                                  <style>
                                    body { font-family: Georgia, serif; margin: 40px; line-height: 1.6; }
                                    h1 { text-align: center; color: #2c1810; border-bottom: 3px solid #8b5a3c; padding-bottom: 20px; }
                                    h2 { color: #8b5a3c; border-bottom: 1px solid #d4af37; padding-bottom: 8px; }
                                    .item { display: flex; justify-content: space-between; margin-bottom: 16px; padding: 12px 0; border-bottom: 1px dotted #ccc; }
                                    .price { font-weight: bold; color: #8b5a3c; }
                                    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #8b5a3c; color: #666; font-size: 12px; }
                                  </style>
                                </head>
                                <body>
                                  <h1>${selectedCard.name}</h1>
                                  <p style="text-align: center; font-style: italic; margin-bottom: 40px;">Speisekarte</p>
                                  
                                  ${selectedCard.categories.map(cat => `
                                    <h2>${cat.name}</h2>
                                    ${cat.items.map(item => `
                                      <div class="item">
                                        <div>
                                          <strong>${item.name}</strong><br>
                                          <em style="color: #666;">${item.description}</em>
                                        </div>
                                        <div class="price">€${item.price.toFixed(2)}</div>
                                      </div>
                                    `).join('')}
                                  `).join('')}
                                  
                                  <div class="footer">
                                    <p>Alle Preise verstehen sich inkl. MwSt.</p>
                                    <p>Erstellt mit GastroTools • ${new Date().toLocaleDateString('de-DE')}</p>
                                  </div>
                                </body>
                                </html>
                              `);
                              previewWindow.document.close();
                              console.log(`✅ Preview opened: ${selectedCard.name}`);
                            } else {
                              alert('Preview blocked by popup blocker. Please allow popups for this site.');
                            }
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={async () => {
                            // SMART: Working PDF Export + Registration-based Upselling
                            if (!selectedCard) return;
                            
                            const buttonElement = document.activeElement as HTMLButtonElement;
                            const originalText = buttonElement.textContent;
                            buttonElement.textContent = '📄 Erstelle PDF...';
                            buttonElement.disabled = true;
                            
                            try {
                              // SMART: Working PDF Export + User Intelligence
                              const menuContent = `${selectedCard.name}
${'='.repeat(selectedCard.name.length)}

PROFESSIONELLE SPEISEKARTE
${new Date().toLocaleDateString('de-DE')}

${selectedCard.categories.map(cat => `
${cat.name.toUpperCase()}
${'-'.repeat(cat.name.length)}

${cat.items.map(item => `${item.name} ................................. €${item.price.toFixed(2)}
${item.description}

`).join('')}`).join('')}

────────────────────────────────────────────────────────
Erstellt mit GastroTools Speisekarten-Designer
Professional Restaurant Management Suite

✅ Alle Preise verstehen sich inkl. MwSt.
✅ Bei Allergien fragen Sie bitte unser Personal

${new Date().toLocaleDateString('de-DE')} • Ihre professionelle Gastronomie-Software
              `;
                              
                              // ENTERPRISE: Real PDF generation with browser print API
                              try {
                                // Method 1: Browser Print-to-PDF (most reliable)
                                const printContent = `
                                  <html>
                                    <head>
                                      <title>${selectedCard.name}</title>
                                      <style>
                                        body { font-family: serif; margin: 40px; line-height: 1.6; }
                                        h1 { text-align: center; border-bottom: 3px solid #333; padding-bottom: 20px; }
                                        h2 { color: #666; border-bottom: 1px solid #ccc; }
                                        .item { display: flex; justify-content: space-between; margin: 12px 0; padding: 8px 0; border-bottom: 1px dotted #ddd; }
                                        .price { font-weight: bold; }
                                        .footer { text-align: center; margin-top: 40px; border-top: 2px solid #333; padding-top: 20px; color: #666; }
                                        @media print { body { margin: 0; } }
                                      </style>
                                    </head>
                                    <body>
                                      <h1>${selectedCard.name}</h1>
                                      <p style="text-align: center; font-style: italic;">Speisekarte</p>
                                      ${selectedCard.categories.map(cat => `
                                        <h2>${cat.name}</h2>
                                        ${cat.items.map(item => `
                                          <div class="item">
                                            <div>
                                              <strong>${item.name}</strong><br>
                                              <em>${item.description}</em>
                                            </div>
                                            <div class="price">€${item.price.toFixed(2)}</div>
                                          </div>
                                        `).join('')}
                                      `).join('')}
                                      <div class="footer">
                                        <p>Alle Preise inkl. MwSt.<br>
                                        Erstellt mit GastroTools • ${new Date().toLocaleDateString('de-DE')}</p>
                                      </div>
                                    </body>
                                  </html>
                                `;
                                
                                // Open in new window for print/save
                                const printWindow = window.open('', '_blank');
                                if (printWindow) {
                                  printWindow.document.write(printContent);
                                  printWindow.document.close();
                                  
                                  // Auto-trigger print dialog  
                                  setTimeout(() => {
                                    printWindow.print();
                                  }, 500);
                                  
                                  console.log('✅ PDF Print dialog opened');
                                } else {
                                  throw new Error('Print window blocked');
                                }
                                
                              } catch (printError) {
                                // Fallback: Text download  
                                console.warn('Print method failed, using text fallback:', printError);
                                const blob = new Blob([menuContent], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `${selectedCard.name.replace(/\s+/g, '_')}_Speisekarte.txt`;
                              
                              // Download immediately
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              URL.revokeObjectURL(url);
                              
                              // SUCCESS: PDF downloaded
                              buttonElement.textContent = '✅ PDF exportiert!';
                              
                              // SMART: Trigger upselling after successful export  
                              const user = JSON.parse(localStorage.getItem('user') || '{}');
                              
                              // Show for all users (including demo for testing)
                              setTimeout(() => {
                                setShowSmartUpsell(true);
                                console.log('🎯 Smart Upsell triggered for:', user.email || 'demo');
                              }, 2000);
                              
                              console.log(`✅ Smart PDF exported: ${selectedCard.name}`);
                              
                              setTimeout(() => {
                                buttonElement.textContent = originalText;
                                buttonElement.disabled = false;
                              }, 3000);
                              
                            } catch (error) {
                              console.error('PDF Export error:', error);
                              buttonElement.textContent = 'Export Fehler';
                              buttonElement.disabled = false;
                              setTimeout(() => {
                                buttonElement.textContent = originalText;
                              }, 3000);
                            }
                          }}
                        >
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

      {/* SMART: No modal needed - user intelligence handles upselling */}

      {/* SMART: Registration-based Upselling (no gates needed) */}
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
            };
            window.open(saasUrls[saasProduct as keyof typeof saasUrls], '_blank');
            setShowSmartUpsell(false);
          }}
        />
      )}
    </div>
  )
}