export interface USDAFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  dataType: string;
  nutrients: NutritionFacts;
  confidence: 'high' | 'medium' | 'low';
  source: string;
  disclaimer: string;
}

export interface NutritionFacts {
  energy?: number;
  fat?: number;
  saturatedFat?: number;
  carbohydrates?: number;
  sugar?: number;
  protein?: number;
  salt?: number;
  fiber?: number;
}

export class USDANutritionService {
  private baseURL = 'https://api.nal.usda.gov/fdc/v1/';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.USDA_API_KEY || 'DEMO_KEY';
  }

  // Deutsche zu englische Begriffe übersetzen
  private translateToEnglish(germanTerm: string): string {
    const translations: Record<string, string> = {
      // Fleisch & Fisch - HACKFLEISCH FIX
      'hackfleisch': 'ground beef',
      'hähnchen': 'chicken',
      'hühnchen': 'chicken',
      'rind': 'beef',
      'rindfleisch': 'beef',
      'schwein': 'pork',
      'schweinefleisch': 'pork',
      'lachs': 'salmon',
      'thunfisch': 'tuna',
      'kabeljau': 'cod',
      
      // Gemüse
      'tomate': 'tomato',
      'tomaten': 'tomatoes',
      'gurke': 'cucumber',
      'paprika': 'bell pepper',
      'zwiebel': 'onion',
      'knoblauch': 'garlic',
      'karotte': 'carrot',
      'möhre': 'carrot',
      'kartoffel': 'potato',
      'kartoffeln': 'potatoes',
      'brokkoli': 'broccoli',
      'spinat': 'spinach',
      
      // Milchprodukte
      'milch': 'milk',
      'käse': 'cheese',
      'butter': 'butter',
      'sahne': 'cream',
      'joghurt': 'yogurt',
      
      // Getreide
      'reis': 'rice',
      'nudeln': 'pasta',
      'brot': 'bread',
      'mehl': 'flour',
      
      // Sonstiges
      'ei': 'egg',
      'eier': 'eggs',
      'öl': 'oil',
      'olivenöl': 'olive oil',
      'zucker': 'sugar',
      'salz': 'salt'
    };
    
    const normalized = germanTerm.toLowerCase().trim();
    return translations[normalized] || germanTerm;
  }

  // Demo-Daten für Development
  private getDemoData(germanName: string): USDAFood[] {
    const demoDatabase: Record<string, USDAFood> = {
      'hackfleisch': {
        fdcId: 174033,
        description: 'Hackfleisch (Rind)',
        dataType: 'SR Legacy',
        nutrients: {
          energy: 254,
          fat: 20.0,
          saturatedFat: 7.7,
          carbohydrates: 0,
          sugar: 0,
          protein: 17.17,
          salt: 0.075,
          fiber: 0
        },
        confidence: 'high',
        source: 'USDA Food Data Central (Demo)',
        disclaimer: 'DEMO-DATEN: Echte USDA-Integration erfordert API-Key.'
      },
      'ground beef': {
        fdcId: 174033,
        description: 'Hackfleisch (Rind)',
        dataType: 'SR Legacy',
        nutrients: {
          energy: 254,
          fat: 20.0,
          saturatedFat: 7.7,
          carbohydrates: 0,
          sugar: 0,
          protein: 17.17,
          salt: 0.075,
          fiber: 0
        },
        confidence: 'high',
        source: 'USDA Food Data Central (Demo)',
        disclaimer: 'DEMO-DATEN: Echte USDA-Integration erfordert API-Key.'
      },
      'chicken': {
        fdcId: 171477,
        description: 'Hähnchenbrust',
        dataType: 'SR Legacy',
        nutrients: {
          energy: 165,
          fat: 3.6,
          saturatedFat: 1.0,
          carbohydrates: 0,
          sugar: 0,
          protein: 31.0,
          salt: 0.074,
          fiber: 0
        },
        confidence: 'high',
        source: 'USDA Food Data Central (Demo)',
        disclaimer: 'DEMO-DATEN: Echte USDA-Integration erfordert API-Key.'
      },
      'potato': {
        fdcId: 170093,
        description: 'Kartoffel',
        dataType: 'SR Legacy',
        nutrients: {
          energy: 77,
          fat: 0.09,
          saturatedFat: 0.02,
          carbohydrates: 17.5,
          sugar: 0.8,
          protein: 2.05,
          salt: 0.006,
          fiber: 2.1
        },
        confidence: 'high',
        source: 'USDA Food Data Central (Demo)',
        disclaimer: 'DEMO-DATEN: Echte USDA-Integration erfordert API-Key.'
      }
    };

    const normalized = germanName.toLowerCase().trim();
    
    // Try direct match first
    let match = demoDatabase[normalized];
    
    // If no direct match, try translated term
    if (!match) {
      const translated = this.translateToEnglish(normalized);
      match = demoDatabase[translated];
    }
    
    console.log(`🇺🇸 USDA Demo search: "${normalized}" → ${match ? 'FOUND' : 'NOT FOUND'}`);
    
    return match ? [match] : [];
  }

  // Hauptsuchfunktion
  async searchIngredient(germanName: string, limit: number = 5): Promise<USDAFood[]> {
    try {
      const englishTerm = this.translateToEnglish(germanName);
      
      // Demo-Daten falls kein echter API-Key verfügbar
      if (this.apiKey === 'DEMO_KEY' || !this.apiKey) {
        console.log('🇺🇸 USDA: Using demo data for', germanName)
        return this.getDemoData(germanName);
      }

      // Real USDA API call would go here
      console.log('🇺🇸 USDA: Real API not implemented, using demo data')
      return this.getDemoData(germanName);

    } catch (error) {
      console.error('USDA API Error:', error);
      return this.getDemoData(germanName);
    }
  }
}

export const usdaService = new USDANutritionService();