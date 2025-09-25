// Menu utilities for card designer
export interface MenuCard {
  id: string
  name: string
  template: string
  categories: MenuCategory[]
  createdAt: string
}

export interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

export interface MenuItem {
  id: string
  name: string
  price: number
  description: string
}

export const createEmptyCard = (name: string, template: string): MenuCard => ({
  id: Date.now().toString(),
  name,
  template,
  categories: [],
  createdAt: new Date().toISOString()
})

export const addCategoryToCard = (card: MenuCard, categoryName: string): MenuCard => ({
  ...card,
  categories: [
    ...card.categories,
    {
      id: Date.now().toString(),
      name: categoryName,
      items: []
    }
  ]
})