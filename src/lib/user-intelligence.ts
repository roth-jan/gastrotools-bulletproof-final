export interface UserProfile {
  email: string
  name: string
  company: string
  role: string
  orgType: string
  registeredAt: string
}

export interface UserBehavior {
  toolsUsed: string[]
  sessionsCount: number
  lastActive: string
  exportActions: number
  recipesCreated: number
  costEntriesAdded: number
  menuItemsPlanned: number
  inventoryItemsManaged: number
}

export interface SmartSuggestion {
  saasProduct: 'webmenue' | 'kuechenmanager' | 'ear'
  confidence: number
  reasoning: string[]
  timing: 'immediate' | 'after_usage' | 'weekly'
  context: string
}

export class UserIntelligence {
  
  static detectSegment(user: UserProfile): 'webmenue' | 'kuechenmanager' | 'ear' {
    const email = user.email.toLowerCase()
    const company = user.company.toLowerCase()
    const orgType = user.orgType.toLowerCase()
    
    // Email domain detection
    if (email.includes('schule') || email.includes('kita') || email.includes('.edu')) {
      return 'webmenue'
    }
    
    // Company name detection
    if (company.includes('schule') || company.includes('kita') || company.includes('kindergarten')) {
      return 'webmenue'
    }
    
    if (company.includes('senioren') || company.includes('pflege') || company.includes('lieferservice')) {
      return 'ear'
    }
    
    // Org type explicit
    if (orgType.includes('schule') || orgType.includes('kita') || orgType.includes('betrieb')) {
      return 'webmenue'
    }
    
    if (orgType.includes('senioren') || orgType.includes('lieferservice') || orgType.includes('bringdienst')) {
      return 'ear'
    }
    
    // Default for professional kitchens
    return 'kuechenmanager'
  }
  
  static generateSmartSuggestion(user: UserProfile, behavior: UserBehavior): SmartSuggestion {
    const segment = this.detectSegment(user)
    const reasoning = []
    let confidence = 0.5
    
    // Behavior-based confidence boost
    if (behavior.menuItemsPlanned >= 5) {
      reasoning.push(`${behavior.menuItemsPlanned} Menüs geplant`)
      confidence += 0.2
    }
    
    if (behavior.costEntriesAdded >= 10) {
      reasoning.push(`${behavior.costEntriesAdded} Kosteneinträge`)
      confidence += 0.2
    }
    
    if (behavior.exportActions >= 3) {
      reasoning.push(`${behavior.exportActions}x Export-Funktionen genutzt`)
      confidence += 0.1
    }
    
    // Time-based engagement
    const daysSinceRegistration = Math.floor(
      (Date.now() - new Date(user.registeredAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysSinceRegistration >= 3 && behavior.sessionsCount >= 3) {
      reasoning.push('Aktive Nutzung über mehrere Tage')
      confidence += 0.1
    }
    
    // Segment-specific suggestions
    const suggestions = {
      webmenue: {
        saasProduct: 'webmenue' as const,
        confidence: Math.min(confidence, 0.95),
        reasoning: [
          ...reasoning,
          'E-Mail-Domain deutet auf Bildungseinrichtung',
          'WebMenü perfekt für bargeldlose Schulverpflegung'
        ],
        timing: behavior.menuItemsPlanned >= 3 ? 'immediate' as const : 'after_usage' as const,
        context: behavior.menuItemsPlanned >= 5 ? 
          `${user.company} könnte ${behavior.menuItemsPlanned} Menüs online anbieten` :
          'Digitale Schulverpflegung für weniger Verwaltungsaufwand'
      },
      
      kuechenmanager: {
        saasProduct: 'kuechenmanager' as const,
        confidence: Math.min(confidence, 0.95),
        reasoning: [
          ...reasoning,
          'Professional Kitchen Management erkannt',
          'KüchenManager für LMIV-Compliance + DATEV'
        ],
        timing: behavior.costEntriesAdded >= 5 ? 'immediate' as const : 'after_usage' as const,
        context: behavior.recipesCreated >= 3 ?
          `${behavior.recipesCreated} Rezepte + Warenwirtschaft = perfekter KüchenManager Use-Case` :
          'EU-konforme Nährwerte + DATEV-Integration automatisch'
      },
      
      ear: {
        saasProduct: 'ear' as const,
        confidence: Math.min(confidence, 0.95),
        reasoning: [
          ...reasoning,
          'Lieferservice/Senioren-Segment erkannt',
          'EAR für Touren + Rechnungen + DATEV'
        ],
        timing: behavior.menuItemsPlanned >= 2 ? 'immediate' as const : 'weekly' as const,
        context: `Starterpakete ab €99/Monat für ${user.company}`
      }
    }
    
    return suggestions[segment]
  }
  
  static shouldShowUpselling(user: UserProfile, behavior: UserBehavior): boolean {
    // Don't show immediately after registration
    const daysSinceRegistration = Math.floor(
      (Date.now() - new Date(user.registeredAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysSinceRegistration < 1) return false
    
    // Show after significant value creation
    const valueScore = behavior.recipesCreated + 
                      behavior.menuItemsPlanned + 
                      Math.floor(behavior.costEntriesAdded / 5) +
                      Math.floor(behavior.inventoryItemsManaged / 10)
    
    return valueScore >= 5 || behavior.exportActions >= 2
  }
  
  static getPersonalizedMessage(user: UserProfile, suggestion: SmartSuggestion): string {
    const messages = {
      webmenue: `💡 Perfekt für ${user.company}: Online-Bestellungen + bargeldlose Abrechnung für Ihre Schüler/Kinder. Weniger Verwaltung, mehr Zeit für Bildung!`,
      kuechenmanager: `💡 Ideal für ${user.company}: EU-konforme Speisepläne + DATEV-Integration. Sparen Sie 10h Verwaltung/Woche!`,
      ear: `💡 Maßgeschneidert für ${user.company}: Tourenplanung + automatische Rechnungen. Starterpakete ab €99/Monat!`
    }
    
    return messages[suggestion.saasProduct]
  }
}