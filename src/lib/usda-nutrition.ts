// USDA Nutrition API service
interface NutritionData {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  allergens: string[]
}

class UsdaNutritionService {
  private apiKey: string | undefined

  constructor() {
    this.apiKey = process.env.USDA_API_KEY
  }

  async validateApiKey(): Promise<boolean> {
    return !!this.apiKey
  }

  async searchIngredient(query: string, limit: number = 5): Promise<NutritionData[]> {
    // Demo data for common ingredients
    const demoData: NutritionData[] = [
      {
        id: '1',
        name: 'Ground Beef (Hackfleisch)',
        calories: 250,
        protein: 25.0,
        carbs: 0.0,
        fat: 17.0,
        fiber: 0.0,
        sugar: 0.0,
        sodium: 75,
        allergens: []
      },
      {
        id: '2',
        name: 'Chicken Breast (Hähnchenbrust)',
        calories: 165,
        protein: 31.0,
        carbs: 0.0,
        fat: 3.6,
        fiber: 0.0,
        sugar: 0.0,
        sodium: 74,
        allergens: []
      },
      {
        id: '3',
        name: 'Tomatoes (Tomaten)',
        calories: 18,
        protein: 0.9,
        carbs: 3.9,
        fat: 0.2,
        fiber: 1.2,
        sugar: 2.6,
        sodium: 5,
        allergens: []
      }
    ]

    // Filter based on query
    const filtered = demoData.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    )

    return filtered.slice(0, limit)
  }

  async getIngredientById(id: string): Promise<NutritionData | null> {
    const results = await this.searchIngredient('')
    return results.find(item => item.id === id) || null
  }
}

export const usdaService = new UsdaNutritionService()