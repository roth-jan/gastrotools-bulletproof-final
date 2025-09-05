'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Navigation } from "@/components/navigation"
import { useLanguage } from "@/contexts/LanguageContext"
import { Calendar, Plus, ChefHat, Clock, Users } from "lucide-react"

interface MenuItem {
  id: string
  name: string
  description: string
  prepTime: number
  servings: number
  day: string
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack'
}

interface WeekMenu {
  [key: string]: MenuItem[]
}

export default function MenuplanerPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [weekMenu, setWeekMenu] = useState<WeekMenu>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  })
  
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    prepTime: 30,
    servings: 4,
    day: 'Monday',
    category: 'lunch' as const
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login?redirect=/menueplaner')
      return
    }
  }, [router])

  const addMenuItem = () => {
    if (!newItem.name) {
      alert('Please enter a dish name')
      return
    }

    const menuItem: MenuItem = {
      id: Date.now().toString(),
      ...newItem
    }

    setWeekMenu(prev => ({
      ...prev,
      [newItem.day]: [...prev[newItem.day], menuItem]
    }))

    // Reset form (FIXED: Don't reset servings to hardcoded 4)
    setNewItem({
      name: '',
      description: '',
      prepTime: 30,
      servings: newItem.servings, // FIXED: Keep current servings setting
      day: newItem.day,          // FIXED: Keep current day setting  
      category: newItem.category // FIXED: Keep current category
    })
  }

  const removeMenuItem = (day: string, itemId: string) => {
    setWeekMenu(prev => ({
      ...prev,
      [day]: prev[day].filter(item => item.id !== itemId)
    }))
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const getTotalItems = () => {
    return Object.values(weekMenu).flat().length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Menu Planner
            </h1>
            <p className="text-xl text-gray-600">
              Plan your weekly menus with professional precision
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-orange-600" />
                  Add Menu Item
                </CardTitle>
                <CardDescription>
                  Add a dish to your weekly menu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Dish Name</Label>
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="e.g., Beef Bolognese"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Brief description of the dish"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Day</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={newItem.day}
                      onChange={(e) => setNewItem({...newItem, day: e.target.value})}
                    >
                      {days.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={newItem.category}
                      onChange={(e) => setNewItem({...newItem, category: e.target.value as any})}
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Prep Time (min)</Label>
                    <Input
                      type="number"
                      value={newItem.prepTime}
                      onChange={(e) => setNewItem({...newItem, prepTime: parseInt(e.target.value) || 0})}
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <Label>Servings</Label>
                    <Input
                      type="number"
                      value={newItem.servings}
                      onChange={(e) => setNewItem({...newItem, servings: parseInt(e.target.value) || 0})}
                      placeholder="4"
                    />
                  </div>
                </div>

                <Button onClick={addMenuItem} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Menu
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  Weekly Menu Overview ({getTotalItems()} items)
                </CardTitle>
                <CardDescription>
                  Your planned menu for the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
                  {days.map(day => (
                    <div key={day} className="space-y-2">
                      <h3 className="font-semibold text-center p-2 bg-orange-100 rounded">
                        {day}
                      </h3>
                      <div className="space-y-2 min-h-40">
                        {weekMenu[day].length === 0 ? (
                          <div className="text-gray-400 text-sm text-center py-4">
                            No items planned
                          </div>
                        ) : (
                          weekMenu[day].map(item => (
                            <div key={item.id} className="p-2 bg-white rounded border text-sm">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-gray-600 text-xs">
                                {item.category} • <Clock className="w-3 h-3 inline" /> {item.prepTime}min
                              </div>
                              <div className="text-gray-600 text-xs">
                                <Users className="w-3 h-3 inline" /> {item.servings} servings
                              </div>
                              <button
                                onClick={() => removeMenuItem(day, item.id)}
                                className="text-red-500 text-xs mt-1 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}