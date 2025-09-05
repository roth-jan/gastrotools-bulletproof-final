import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const trackingData = await request.json()
    
    // Validate required fields
    if (!trackingData.event || !trackingData.sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: event, sessionId' },
        { status: 400 }
      )
    }

    // Enhanced tracking data
    const enrichedData = {
      ...trackingData,
      timestamp: trackingData.timestamp || new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      referer: request.headers.get('referer') || '',
      // Add Vercel-specific headers for debugging
      vercelId: request.headers.get('x-vercel-id'),
      deployment: process.env.VERCEL_URL || 'local'
    }

    // TODO: Save to analytics database (Mixpanel, PostHog, etc.)
    // For now: comprehensive logging
    
    if (trackingData.event === 'lead_submitted') {
      console.log('🎯 LEAD CAPTURED:', {
        email: trackingData.properties?.email || 'unknown',
        segment: trackingData.properties?.lead_segment,
        tool: trackingData.properties?.tool,
        orgTyp: trackingData.properties?.org_typ,
        interesse: trackingData.properties?.interesse
      })
    } else if (trackingData.event === 'aha_reached') {
      console.log('💡 AHA MOMENT:', {
        tool: trackingData.properties?.tool,
        type: trackingData.properties?.aha_type,
        dataPoints: trackingData.properties?.data_points
      })
    } else if (trackingData.event === 'export_clicked') {
      console.log('📤 EXPORT REQUESTED:', {
        tool: trackingData.properties?.tool,
        format: trackingData.properties?.format,
        size: trackingData.properties?.data_size
      })
    }

    // Always log full event for debugging
    console.log('📊 TRACKING EVENT:', enrichedData)

    return NextResponse.json({
      success: true,
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      tracked: true
    })

  } catch (error) {
    console.error('Tracking error:', error)
    return NextResponse.json(
      { error: 'Tracking failed' },
      { status: 500 }
    )
  }
}