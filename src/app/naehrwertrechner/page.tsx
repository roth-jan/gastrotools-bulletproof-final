'use client'

import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Plus, Trash2, Calculator, Search } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { searchIngredients, searchIngredientsUSDA, NutritionData } from '@/lib/nutrition-database'
import { useLanguage } from '@/contexts/LanguageContext'

interface Ingredient {
  id: string
  name: string
  amount: number
  unit: 'g' | 'ml' | 'Stück'
  energy: number
  fat: number
  saturatedFat: number
  carbohydrates: number
  sugar: number
  protein: number
  salt: number
}

interface Recipe {
  name: string
  portions: number
  ingredients: Ingredient[]
}

export default function NaehrwertrechnerPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const autocompleteRef = useRef<HTMLDivElement>(null)
  
  const [recipe, setRecipe] = useState<Recipe>({
    name: '',
    portions: 1,
    ingredients: []
  })
  
  const [currentIngredient, setCurrentIngredient] = useState<Partial<Ingredient>>({
    name: '',
    amount: 100,
    unit: 'g',
    energy: 0,
    fat: 0,
    saturatedFat: 0,
    carbohydrates: 0,
    sugar: 0,
    protein: 0,
    salt: 0
  })
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<NutritionData[]>([])
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [useUSDA, setUseUSDA] = useState(true) // Default to USDA for better results
  const [isSearching, setIsSearching] = useState(false)
  const [nutrition, setNutrition] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login?redirect=/naehrwertrechner')
      return
    }
  }, [router])

  // Autocomplete search
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.length > 1) {
        setIsSearching(true)
        try {
          let results: NutritionData[]
          
          if (useUSDA) {
            results = await searchIngredientsUSDA(searchQuery, 5)
            if (results.length === 0) {
              results = searchIngredients(searchQuery)
            }
          } else {
            results = searchIngredients(searchQuery)
          }
          
          setSearchResults(results.slice(0, 5))
          setShowAutocomplete(results.length > 0)
        } catch (error) {
          console.error('Search error:', error)
          const results = searchIngredients(searchQuery)
          setSearchResults(results.slice(0, 5))
          setShowAutocomplete(results.length > 0)
        } finally {
          setIsSearching(false)
        }
      } else {
        setShowAutocomplete(false)
        setSearchResults([])
      }
    }

    const timeoutId = setTimeout(performSearch, 500)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, useUSDA])

  const selectIngredient = (ingredient: NutritionData) => {
    setSearchQuery(ingredient.name)
    setCurrentIngredient({
      ...currentIngredient,
      name: ingredient.name,
      amount: 100,
      energy: ingredient.energy,
      fat: ingredient.fat,
      saturatedFat: ingredient.saturatedFat,
      carbohydrates: ingredient.carbohydrates,
      sugar: ingredient.sugar,
      protein: ingredient.protein,
      salt: ingredient.salt
    })
    setShowAutocomplete(false)
  }

  const addIngredient = () => {
    const ingredientName = currentIngredient.name || searchQuery.trim();
    const ingredientAmount = currentIngredient.amount || 100;
    
    if (ingredientName && ingredientAmount > 0) {
      const newIngredient = {
        ...currentIngredient,
        name: ingredientName,
        amount: ingredientAmount,
        id: Date.now().toString()
      } as Ingredient;
      
      setRecipe({
        ...recipe,
        ingredients: [...recipe.ingredients, newIngredient]
      });
      
      // Reset form
      setCurrentIngredient({
        name: '',
        amount: 100,
        unit: 'g',
        energy: 0,
        fat: 0,
        saturatedFat: 0,
        carbohydrates: 0,
        sugar: 0,
        protein: 0,
        salt: 0
      });
      
      setSearchQuery('')
      setShowAutocomplete(false)
    }
  }

  const removeIngredient = (id: string) => {
    setRecipe({
      ...recipe,
      ingredients: recipe.ingredients.filter(ing => ing.id !== id)
    })
  }

  const calculateNutrition = () => {
    const totalWeight = recipe.ingredients.reduce((sum, ing) => sum + ing.amount, 0)
    if (totalWeight === 0) return

    setIsCalculating(true)
    
    // Calculate nutrition per 100g
    const factor = 100 / totalWeight
    const calculatedNutrition = {
      energy: recipe.ingredients.reduce((sum, ing) => sum + (ing.energy * ing.amount / 100), 0) * factor,
      fat: recipe.ingredients.reduce((sum, ing) => sum + (ing.fat * ing.amount / 100), 0) * factor,
      saturatedFat: recipe.ingredients.reduce((sum, ing) => sum + (ing.saturatedFat * ing.amount / 100), 0) * factor,
      carbohydrates: recipe.ingredients.reduce((sum, ing) => sum + (ing.carbohydrates * ing.amount / 100), 0) * factor,
      sugar: recipe.ingredients.reduce((sum, ing) => sum + (ing.sugar * ing.amount / 100), 0) * factor,
      protein: recipe.ingredients.reduce((sum, ing) => sum + (ing.protein * ing.amount / 100), 0) * factor,
      salt: recipe.ingredients.reduce((sum, ing) => sum + (ing.salt * ing.amount / 100), 0) * factor
    }
    
    setTimeout(() => {
      setNutrition(calculatedNutrition)
      setIsCalculating(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('nutrition.title')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('nutrition.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Recipe Data
                </CardTitle>
                <CardDescription>
                  Enter your recipe information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('nutrition.recipe_name')}</Label>
                  <Input
                    value={recipe.name}
                    onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
                    placeholder="Recipe Name"
                  />
                </div>
                
                <div>
                  <Label>{t('nutrition.portions')}</Label>
                  <Input
                    type="number"
                    value={recipe.portions}
                    onChange={(e) => setRecipe({ ...recipe, portions: parseInt(e.target.value) || 1 })}
                    placeholder="Portions"
                    min="1"
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{t('nutrition.add_ingredient')}</h3>
                    <Button
                      variant={useUSDA ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseUSDA(!useUSDA)}
                    >
                      {useUSDA ? "🇺🇸 USDA (20,000+)" : "📁 Local (2,500+)"}
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label>Search Ingredient</Label>
                      <div className="relative" ref={autocompleteRef}>
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Add ingredient (e.g., Hackfleisch)"
                          className="pr-10"
                          disabled={isSearching}
                        />
                        {isSearching ? (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                          </div>
                        ) : (
                          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        )}
                        
                        {/* Autocomplete Results */}
                        {showAutocomplete && searchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {searchResults.map((result, index) => (
                              <div
                                key={`${result.name}-${index}`}
                                onClick={() => selectIngredient(result)}
                                className="px-3 py-2 cursor-pointer border-b last:border-b-0 hover:bg-gray-50"
                              >
                                <div className="font-medium text-gray-900">{result.name}</div>
                                <div className="text-sm text-gray-600">
                                  🔥 {result.energy || 0} kcal • 🥩 {result.protein || 0}g Protein
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>{t('nutrition.amount')}</Label>
                        <Input
                          type="number"
                          value={currentIngredient.amount || ''}
                          onChange={(e) => setCurrentIngredient({ ...currentIngredient, amount: parseFloat(e.target.value) || 0 })}
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <Label>{t('nutrition.unit')}</Label>
                        <select
                          className="w-full px-3 py-2 border rounded-md"
                          value={currentIngredient.unit}
                          onChange={(e) => setCurrentIngredient({ ...currentIngredient, unit: e.target.value as 'g' | 'ml' | 'Stück' })}
                        >
                          <option value="g">g</option>
                          <option value="ml">ml</option>
                          <option value="Stück">Stück</option>
                        </select>
                      </div>
                    </div>

                    <Button onClick={addIngredient} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      {t('nutrition.add_ingredient')}
                    </Button>
                  </div>

                  {recipe.ingredients.length > 0 && (
                    <div className="mt-4">
                      <Button
                        onClick={calculateNutrition}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        disabled={isCalculating}
                      >
                        <Calculator className="w-4 h-4 mr-2" />
                        {isCalculating ? t('nutrition.calculating') : t('nutrition.calculate')}
                      </Button>
                    </div>
                  )}
                </div>

                {recipe.ingredients.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Ingredients</h3>
                    <div className="space-y-2">
                      {recipe.ingredients.map((ing) => (
                        <div key={ing.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span>{ing.amount}{ing.unit} {ing.name}</span>
                          <Button
                            onClick={() => removeIngredient(ing.id)}
                            variant="ghost"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-purple-600" />
                  Nutrition Facts per 100g
                </CardTitle>
                <CardDescription>
                  EU-compliant nutrition table
                </CardDescription>
              </CardHeader>
              <CardContent>
                {nutrition ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-800">
                        <th className="text-left pb-2">Nutrition</th>
                        <th className="text-right pb-2">per 100g</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-2 font-semibold">Energy</td>
                        <td className="text-right">{nutrition.energy.toFixed(0)} kcal</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold">Fat</td>
                        <td className="text-right">{nutrition.fat.toFixed(1)} g</td>
                      </tr>
                      <tr>
                        <td className="py-2 pl-4">of which saturated</td>
                        <td className="text-right">{nutrition.saturatedFat.toFixed(1)} g</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold">Carbohydrates</td>
                        <td className="text-right">{nutrition.carbohydrates.toFixed(1)} g</td>
                      </tr>
                      <tr>
                        <td className="py-2 pl-4">of which sugars</td>
                        <td className="text-right">{nutrition.sugar.toFixed(1)} g</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold">Protein</td>
                        <td className="text-right">{nutrition.protein.toFixed(1)} g</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold">Salt</td>
                        <td className="text-right">{nutrition.salt.toFixed(2)} g</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Add ingredients to calculate nutrition values
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}