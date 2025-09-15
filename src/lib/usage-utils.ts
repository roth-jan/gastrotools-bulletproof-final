// Usage tracking utilities
interface UsageLimit {
  recipes: number
  menuCards: number
  exports: number
  inventoryItems: number
}

interface UsageTracking {
  userId: string
  recipesCount: number
  speisekartenCount: number
  exportsCount: number
  inventoryCount: number
  lastReset: Date
}

const FREE_LIMITS: UsageLimit = {
  recipes: 10,
  menuCards: 3,
  exports: 5,
  inventoryItems: 100
}

// Demo data store (in production this would be in database)
const usageStore = new Map<string, UsageTracking>()

export async function checkUsageLimit(
  userId: string,
  type: keyof UsageLimit
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const usage = await getUserUsage(userId)
  const limit = FREE_LIMITS[type]

  let currentCount = 0
  switch (type) {
    case 'recipes':
      currentCount = usage.recipesCount
      break
    case 'menuCards':
      currentCount = usage.speisekartenCount
      break
    case 'exports':
      currentCount = usage.exportsCount
      break
    case 'inventoryItems':
      currentCount = usage.inventoryCount
      break
  }

  return {
    allowed: currentCount < limit,
    remaining: Math.max(0, limit - currentCount),
    limit
  }
}

export async function incrementUsage(
  userId: string,
  type: keyof UsageLimit,
  amount: number = 1
): Promise<void> {
  const usage = await getUserUsage(userId)

  switch (type) {
    case 'recipes':
      usage.recipesCount += amount
      break
    case 'menuCards':
      usage.speisekartenCount += amount
      break
    case 'exports':
      usage.exportsCount += amount
      break
    case 'inventoryItems':
      usage.inventoryCount += amount
      break
  }

  usageStore.set(userId, usage)
}

export async function getUserUsage(userId: string): Promise<UsageTracking> {
  if (!usageStore.has(userId)) {
    usageStore.set(userId, {
      userId,
      recipesCount: 0,
      speisekartenCount: 0,
      exportsCount: 0,
      inventoryCount: 0,
      lastReset: new Date()
    })
  }

  return usageStore.get(userId)!
}

export async function resetMonthlyUsage(userId: string): Promise<void> {
  usageStore.set(userId, {
    userId,
    recipesCount: 0,
    speisekartenCount: 0,
    exportsCount: 0,
    inventoryCount: 0,
    lastReset: new Date()
  })
}