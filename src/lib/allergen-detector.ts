// EU Regulation 1169/2011 compliant allergen detection
export const EU_ALLERGENS = [
  'gluten',
  'crustaceans',
  'eggs',
  'fish',
  'peanuts',
  'soybeans',
  'milk',
  'nuts',
  'celery',
  'mustard',
  'sesame',
  'sulphites',
  'lupin',
  'molluscs'
] as const

export type Allergen = typeof EU_ALLERGENS[number]

interface AllergenKeywords {
  [key: string]: Allergen[]
}

const ALLERGEN_KEYWORDS: AllergenKeywords = {
  // Gluten
  'wheat': ['gluten'],
  'flour': ['gluten'],
  'bread': ['gluten'],
  'pasta': ['gluten'],
  'weizen': ['gluten'],
  'mehl': ['gluten'],
  'brot': ['gluten'],

  // Eggs
  'egg': ['eggs'],
  'eggs': ['eggs'],
  'ei': ['eggs'],
  'eier': ['eggs'],

  // Milk/Dairy
  'milk': ['milk'],
  'cheese': ['milk'],
  'butter': ['milk'],
  'cream': ['milk'],
  'milch': ['milk'],
  'käse': ['milk'],
  'sahne': ['milk'],

  // Nuts
  'nuts': ['nuts'],
  'almond': ['nuts'],
  'walnut': ['nuts'],
  'nüsse': ['nuts'],
  'mandel': ['nuts'],
  'walnuss': ['nuts'],

  // Fish
  'fish': ['fish'],
  'salmon': ['fish'],
  'tuna': ['fish'],
  'fisch': ['fish'],
  'lachs': ['fish'],

  // Peanuts
  'peanut': ['peanuts'],
  'erdnuss': ['peanuts'],

  // Soy
  'soy': ['soybeans'],
  'soja': ['soybeans'],

  // Celery
  'celery': ['celery'],
  'sellerie': ['celery'],

  // Mustard
  'mustard': ['mustard'],
  'senf': ['mustard'],

  // Sesame
  'sesame': ['sesame'],
  'sesam': ['sesame'],

  // Sulphites
  'sulfite': ['sulphites'],
  'sulfit': ['sulphites'],
  'preservative': ['sulphites']
}

export class AllergenDetector {
  detectAllergens(text: string): Allergen[] {
    const detectedAllergens = new Set<Allergen>()
    const lowerText = text.toLowerCase()

    Object.entries(ALLERGEN_KEYWORDS).forEach(([keyword, allergens]) => {
      if (lowerText.includes(keyword)) {
        allergens.forEach(allergen => detectedAllergens.add(allergen))
      }
    })

    return Array.from(detectedAllergens)
  }

  formatAllergensForDisplay(allergens: Allergen[], language: 'de' | 'en' = 'de'): string {
    if (allergens.length === 0) return ''

    const translations = {
      de: {
        gluten: 'Gluten',
        crustaceans: 'Krebstiere',
        eggs: 'Eier',
        fish: 'Fisch',
        peanuts: 'Erdnüsse',
        soybeans: 'Soja',
        milk: 'Milch',
        nuts: 'Nüsse',
        celery: 'Sellerie',
        mustard: 'Senf',
        sesame: 'Sesam',
        sulphites: 'Sulfite',
        lupin: 'Lupinen',
        molluscs: 'Weichtiere'
      },
      en: {
        gluten: 'Gluten',
        crustaceans: 'Crustaceans',
        eggs: 'Eggs',
        fish: 'Fish',
        peanuts: 'Peanuts',
        soybeans: 'Soy',
        milk: 'Milk',
        nuts: 'Nuts',
        celery: 'Celery',
        mustard: 'Mustard',
        sesame: 'Sesame',
        sulphites: 'Sulphites',
        lupin: 'Lupin',
        molluscs: 'Molluscs'
      }
    }

    return allergens
      .map(allergen => translations[language][allergen])
      .join(', ')
  }

  isAllergenFree(text: string, allergen: Allergen): boolean {
    const detected = this.detectAllergens(text)
    return !detected.includes(allergen)
  }
}