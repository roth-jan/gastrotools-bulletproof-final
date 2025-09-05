export interface TrackingEvent {
  event: string
  timestamp: string
  sessionId: string
  userId?: string
  properties: {[key: string]: any}
}

export interface LeadSubmittedEvent extends TrackingEvent {
  event: 'lead_submitted'
  properties: {
    tool: string
    lead_segment: 'webmenue' | 'kuechenmanager' | 'ear'
    rolle: string
    org_typ: string
    interesse: string[]
    aha_moment: string // menu_created, cost_entries_3+, recipe_saved, etc.
    source: 'freeware'
    export_type: 'pdf' | 'csv' | 'preview'
  }
}

export interface AhaMomentEvent extends TrackingEvent {
  event: 'aha_reached'
  properties: {
    tool: string
    aha_type: 'menu_created' | 'cost_entries_3+' | 'recipe_saved' | 'inventory_managed' | 'pdf_requested'
    data_points: number // recipes, entries, items, etc.
  }
}

export interface ExportClickedEvent extends TrackingEvent {
  event: 'export_clicked' 
  properties: {
    tool: string
    format: 'pdf' | 'csv'
    data_size: number
    gate_shown: boolean
  }
}

export class LeadTracker {
  private sessionId: string
  private baseUrl: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  }

  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
  }

  async track(event: TrackingEvent): Promise<boolean> {
    try {
      const response = await fetch('/api/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          timestamp: new Date().toISOString(),
          sessionId: this.sessionId,
          userAgent: navigator.userAgent,
          referrer: document.referrer
        })
      })

      if (response.ok) {
        console.log(`✅ Tracked: ${event.event}`, event.properties)
        return true
      } else {
        console.warn(`⚠️ Tracking failed: ${response.status}`)
        return false
      }
    } catch (error) {
      console.error('❌ Tracking error:', error)
      return false
    }
  }

  // Convenience methods for specific events
  async trackLeadSubmitted(data: LeadSubmittedEvent['properties']): Promise<boolean> {
    return this.track({
      event: 'lead_submitted',
      timestamp: '',
      sessionId: this.sessionId,
      properties: data
    })
  }

  async trackAhaMoment(tool: string, ahaType: string, dataPoints: number = 1): Promise<boolean> {
    return this.track({
      event: 'aha_reached',
      timestamp: '',
      sessionId: this.sessionId,
      properties: {
        tool,
        aha_type: ahaType as any,
        data_points: dataPoints
      }
    })
  }

  async trackExportClick(tool: string, format: 'pdf' | 'csv' | 'preview', dataSize: number): Promise<boolean> {
    return this.track({
      event: 'export_clicked',
      timestamp: '',
      sessionId: this.sessionId,
      properties: {
        tool,
        format,
        data_size: dataSize,
        gate_shown: true
      }
    })
  }

  async trackToolOpened(tool: string): Promise<boolean> {
    return this.track({
      event: 'tool_opened',
      timestamp: '',
      sessionId: this.sessionId,
      properties: { tool }
    })
  }
}

// Segment detection based on user behavior
export function detectSegment(orgTyp: string, interesse: string[]): string {
  if (orgTyp.includes('Schule') || orgTyp.includes('Kita') || orgTyp.includes('Betrieb')) {
    return 'webmenue'
  }
  
  if (orgTyp.includes('Senioren') || orgTyp.includes('Lieferservice')) {
    return 'ear'
  }
  
  if (interesse.includes('kuechenmanager') || orgTyp.includes('Caterer')) {
    return 'kuechenmanager'
  }
  
  // Default based on most common interest
  if (interesse.includes('webmenue')) return 'webmenue'
  if (interesse.includes('ear')) return 'ear'
  
  return 'kuechenmanager' // Default fallback
}

// Export singleton tracker
export const leadTracker = new LeadTracker()