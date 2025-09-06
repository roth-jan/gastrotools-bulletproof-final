export interface TriggerConditions {
  user: {
    email: string
    company: string
    role: string
    orgType: string
    registeredAt: string
  }
  behavior: {
    exportActions: number
    menuItemsPlanned: number
    costEntriesAdded: number
    recipesCreated: number
    sessionsCount: number
    lastActive: string
  }
  context: string
}

export class SmartTriggers {
  
  static shouldShowUpsell(conditions: TriggerConditions): { show: boolean; reason: string; confidence: number } {
    const { user, behavior, context } = conditions
    
    // ENTERPRISE: Frequency capping with smart logic
    const lastShown = localStorage.getItem(`upsell_shown_${user.email}`)
    if (lastShown) {
      const daysSince = Math.floor((Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24))
      if (daysSince < 7) {
        return { show: false, reason: 'frequency_capped', confidence: 0 }
      }
    }
    
    // Don't show if dismissed recently
    const dismissed = localStorage.getItem(`upsell_dismissed_${user.email}`)
    if (dismissed) {
      const hoursSince = Math.floor((Date.now() - parseInt(dismissed)) / (1000 * 60 * 60))
      if (hoursSince < 24) {
        return { show: false, reason: 'recently_dismissed', confidence: 0 }
      }
    }
    
    // TRIGGER CONDITIONS (your smart logic)
    let confidence = 0.3
    let reasons = []
    
    // 1. Export succeeded (high intent)
    if (context === 'pdf_export_success' || context === 'csv_export_success') {
      confidence += 0.4
      reasons.push('export_succeeded')
    }
    
    // 2. Menu items created (value proven)
    if (behavior.menuItemsPlanned >= 1) {
      confidence += 0.2
      reasons.push('menu_items_created')
    }
    
    // 3. Multiple tool usage (engaged user)
    const toolsUsed = [
      behavior.menuItemsPlanned > 0 ? 'menueplaner' : '',
      behavior.costEntriesAdded > 0 ? 'kostenkontrolle' : '',
      behavior.recipesCreated > 0 ? 'naehrwert' : '',
      behavior.exportActions > 0 ? 'export' : ''
    ].filter(Boolean)
    
    if (toolsUsed.length >= 2) {
      confidence += 0.1
      reasons.push('multi_tool_usage')
    }
    
    // 4. Role-based targeting
    const targetRoles = ['schulleitung', 'küchenleitung', 'geschäftsführung', 'inhaber']
    const roleMatch = targetRoles.some(role => 
      user.role?.toLowerCase().includes(role) || 
      user.role?.toLowerCase().includes(role.replace('leitung', ''))
    )
    
    if (roleMatch) {
      confidence += 0.1
      reasons.push('target_role_match')
    }
    
    // 5. Organization type targeting
    const targetOrgs = ['schule', 'kita', 'kindergarten', 'restaurant', 'gastro', 'catering']
    const orgMatch = targetOrgs.some(org => 
      user.orgType?.toLowerCase().includes(org) ||
      user.company?.toLowerCase().includes(org)
    )
    
    if (orgMatch) {
      confidence += 0.1
      reasons.push('org_type_match')
    }
    
    // 6. Time-based readiness (not immediate)
    const hoursSinceRegistration = Math.floor(
      (Date.now() - new Date(user.registeredAt).getTime()) / (1000 * 60 * 60)
    )
    
    if (hoursSinceRegistration >= 2) {
      confidence += 0.05
      reasons.push('time_ready')
    }
    
    // Decision logic
    const shouldShow = confidence >= 0.6 && reasons.length >= 2
    
    return {
      show: shouldShow,
      reason: reasons.join(', '),
      confidence: Math.round(confidence * 100) / 100
    }
  }

  static getPersonalizedMessage(conditions: TriggerConditions): string {
    const { user, behavior } = conditions
    
    // Smart segment detection
    const segment = this.detectSegment(user)
    
    const messages = {
      webmenue: `Perfekt für ${user.company}: Online-Bestellungen für Ihre Schüler/Kinder. ${behavior.menuItemsPlanned} geplante Menüs könnten automatisch online angeboten werden!`,
      kuechenmanager: `Ideal für ${user.company}: EU-konforme Nährwerte + DATEV-Integration. Mit ${behavior.costEntriesAdded} Kosteneinträgen sparen Sie 10h Verwaltung/Woche!`,
      ear: `Maßgeschneidert für ${user.company}: Tourenplanung + automatische Rechnungen. Starterpakete ab €99/Monat für Ihren Lieferservice!`
    }
    
    return messages[segment] || messages.webmenue
  }

  private static detectSegment(user: any): 'webmenue' | 'kuechenmanager' | 'ear' {
    const email = user.email?.toLowerCase() || ''
    const company = user.company?.toLowerCase() || ''
    const orgType = user.orgType?.toLowerCase() || ''
    
    // School/Kita detection
    if (email.includes('schule') || email.includes('kita') || 
        company.includes('schule') || company.includes('kita') ||
        orgType.includes('schule') || orgType.includes('kita')) {
      return 'webmenue'
    }
    
    // Delivery service detection  
    if (company.includes('senioren') || company.includes('lieferservice') ||
        company.includes('bringdienst') || orgType.includes('senioren')) {
      return 'ear'
    }
    
    // Default: professional kitchen
    return 'kuechenmanager'
  }

  static trackUpsellEvent(user: any, action: 'shown' | 'clicked' | 'dismissed', context: string) {
    const event = {
      timestamp: new Date().toISOString(),
      user_email: user.email,
      company: user.company,
      action,
      context,
      device_type: typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop',
      user_agent: navigator.userAgent
    }
    
    // Send to analytics
    fetch('/api/analytics/upsell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).catch(e => console.error('Analytics error:', e))
    
    console.log('🎯 Smart Trigger Event:', event)
  }
}