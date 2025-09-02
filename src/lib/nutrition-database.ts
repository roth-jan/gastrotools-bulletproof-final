export interface NutritionData {
  name: string
  energy: number
  fat: number
  saturatedFat: number
  carbohydrates: number
  sugar: number
  protein: number
  salt: number
  category: string
}

export const nutritionDatabase: NutritionData[] = [
  // Fleisch - HACKFLEISCH INCLUDED
  { name: "Hackfleisch", energy: 254, fat: 20, saturatedFat: 7.7, carbohydrates: 0, sugar: 0, protein: 17.2, salt: 0.075, category: "Fleisch" },
  { name: "Rindfleisch mager", energy: 250, fat: 15, saturatedFat: 6.5, carbohydrates: 0, sugar: 0, protein: 26, salt: 0.15, category: "Fleisch" },
  { name: "Hähnchenbrust", energy: 165, fat: 3.6, saturatedFat: 1, carbohydrates: 0, sugar: 0, protein: 31, salt: 0.074, category: "Fleisch" },
  { name: "Schweinefleisch mager", energy: 143, fat: 5, saturatedFat: 1.8, carbohydrates: 0, sugar: 0, protein: 22, salt: 0.11, category: "Fleisch" },
  
  // Gemüse
  { name: "Tomate", energy: 18, fat: 0.2, saturatedFat: 0.03, carbohydrates: 3.9, sugar: 2.6, protein: 0.9, salt: 0.01, category: "Gemüse" },
  { name: "Kartoffel", energy: 77, fat: 0.1, saturatedFat: 0.02, carbohydrates: 17.5, sugar: 0.8, protein: 2, salt: 0.006, category: "Gemüse" },
  { name: "Zwiebel", energy: 40, fat: 0.1, saturatedFat: 0.02, carbohydrates: 9.3, sugar: 4.2, protein: 1.1, salt: 0.004, category: "Gemüse" },
  { name: "Paprika rot", energy: 31, fat: 0.3, saturatedFat: 0.05, carbohydrates: 6, sugar: 4.2, protein: 1, salt: 0.004, category: "Gemüse" },
  
  // Milchprodukte
  { name: "Vollmilch", energy: 64, fat: 3.5, saturatedFat: 2.3, carbohydrates: 4.7, sugar: 4.7, protein: 3.3, salt: 0.1, category: "Milchprodukte" },
  { name: "Käse Gouda", energy: 356, fat: 27.4, saturatedFat: 17.6, carbohydrates: 2.2, sugar: 2.2, protein: 24.9, salt: 2.0, category: "Milchprodukte" },
  
  // Getreide
  { name: "Reis weiß", energy: 130, fat: 0.3, saturatedFat: 0.08, carbohydrates: 28, sugar: 0.1, protein: 2.7, salt: 0.005, category: "Getreide" },
  { name: "Nudeln", energy: 371, fat: 1.5, saturatedFat: 0.3, carbohydrates: 75, sugar: 2.7, protein: 13, salt: 0.006, category: "Getreide" }
]

export function searchIngredients(query: string): NutritionData[] {
  const searchTerm = query.toLowerCase()
  return nutritionDatabase
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
    )
    .map(item => ({
      ...item,
      source: 'local',
      confidence: 'medium' as const
    } as any))
}

export async function searchIngredientsUSDA(query: string, limit: number = 5): Promise<NutritionData[]> {
  try {
    const response = await fetch('/api/nutrition/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ query, limit })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.results.map((food: any) => ({
      name: food.description,
      energy: food.nutrients.energy || 0,
      fat: food.nutrients.fat || 0,
      saturatedFat: food.nutrients.saturatedFat || 0,
      carbohydrates: food.nutrients.carbohydrates || 0,
      sugar: food.nutrients.sugar || 0,
      protein: food.nutrients.protein || 0,
      salt: food.nutrients.salt || 0,
      category: food.dataType,
      source: 'USDA',
      confidence: food.confidence
    }));

  } catch (error) {
    console.error('USDA search failed, falling back to local database:', error);
    return searchIngredients(query);
  }
}