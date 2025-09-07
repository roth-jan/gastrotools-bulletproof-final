import { NextRequest, NextResponse } from 'next/server'

// In-memory event storage for staging
const eventStorage: Array<{
  id: string
  event: string
  timestamp: string
  userId?: string
  properties: {[key: string]: any}
  sessionId: string
  userAgent?: string
}> = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const userId = searchParams.get('userId')
    const eventType = searchParams.get('event')
    
    let filteredEvents = [...eventStorage]
    
    if (userId) {
      filteredEvents = filteredEvents.filter(e => e.userId === userId)
    }
    
    if (eventType) {
      filteredEvents = filteredEvents.filter(e => e.event === eventType)
    }
    
    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    // Limit results
    const recentEvents = filteredEvents.slice(0, limit)
    
    return NextResponse.json({
      success: true,
      events: recentEvents,
      total: filteredEvents.length,
      showing: recentEvents.length,
      filters: { userId, eventType, limit }
    })

  } catch (error) {
    console.error('Event viewer error:', error)
    return NextResponse.json(
      { error: 'Event retrieval failed' },
      { status: 500 }
    )
  }
}

// Store event for staging tracking
export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()
    
    const event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      event: eventData.event,
      timestamp: new Date().toISOString(),
      userId: eventData.userId,
      properties: eventData.properties || {},
      sessionId: eventData.sessionId || 'unknown',
      userAgent: request.headers.get('user-agent')?.substring(0, 100) || 'unknown'
    }
    
    // Add to storage (keep last 1000 events)
    eventStorage.unshift(event)
    if (eventStorage.length > 1000) {
      eventStorage.splice(1000)
    }
    
    // Log important events
    if (['signup_completed', 'export_succeeded', 'upsell_shown', 'demo_requested'].includes(event.event)) {
      console.log('📊 Business Event:', {
        event: event.event,
        userId: event.userId,
        timestamp: event.timestamp,
        key_properties: {
          segment: event.properties.segment,
          tool: event.properties.tool,
          filename: event.properties.filename
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      eventId: event.id,
      stored: true
    })

  } catch (error) {
    console.error('Event storage error:', error)
    return NextResponse.json(
      { error: 'Event storage failed' },
      { status: 500 }
    )
  }
}