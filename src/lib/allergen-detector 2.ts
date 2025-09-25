// Allergen detection for nutrition calculator
export const detectAllergens = (ingredients: string[]) => {
  const allergens = {
    gluten: false,
    dairy: false,
    eggs: false,
    nuts: false,
    soy: false,
    fish: false,
    shellfish: false
  }
  
  // Simple allergen detection logic
  ingredients.forEach(ingredient => {
    const lower = ingredient.toLowerCase()
    if (lower.includes('weizen') || lower.includes('roggen')) allergens.gluten = true
    if (lower.includes('milch') || lower.includes('käse')) allergens.dairy = true
    if (lower.includes('ei')) allergens.eggs = true
    if (lower.includes('nuss') || lower.includes('mandel')) allergens.nuts = true
  })
  
  return allergens
}