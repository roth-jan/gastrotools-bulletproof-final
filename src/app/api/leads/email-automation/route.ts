import { NextRequest, NextResponse } from 'next/server'

interface EmailAutomationRequest {
  leadId: string
  segment: 'webmenue' | 'kuechenmanager' | 'ear'
  email: string
  orgTyp: string
  interesse: string[]
  triggerEvent: string
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailAutomationRequest = await request.json()
    
    const emailSequence = await generateEmailSequence(body)
    
    // TODO: Integrate with Resend/SendGrid
    console.log('📧 Email automation triggered:', {
      leadId: body.leadId,
      segment: body.segment,
      sequenceLength: emailSequence.length,
      firstEmail: emailSequence[0]?.subject
    })

    return NextResponse.json({
      success: true,
      sequenceId: `seq_${Date.now()}`,
      emailsScheduled: emailSequence.length,
      nextEmail: emailSequence[0]?.scheduledFor
    })

  } catch (error) {
    console.error('Email automation error:', error)
    return NextResponse.json(
      { error: 'Email automation failed' },
      { status: 500 }
    )
  }
}

async function generateEmailSequence(leadData: EmailAutomationRequest) {
  const baseDate = new Date()
  
  const sequences = {
    webmenue: [
      {
        delay: 0,
        subject: 'Ihre Speisekarte + WebMenü für Schulen & Kitas',
        template: 'webmenue_welcome',
        scheduledFor: new Date(baseDate.getTime())
      },
      {
        delay: 24 * 60 * 60 * 1000, // 24h
        subject: 'So digitalisieren andere Schulen ihre Mensa',
        template: 'webmenue_case_studies',
        scheduledFor: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)
      },
      {
        delay: 72 * 60 * 60 * 1000, // 72h
        subject: 'Kostenlose WebMenü Demo - Ihre Termine',
        template: 'webmenue_demo_invitation',
        scheduledFor: new Date(baseDate.getTime() + 72 * 60 * 60 * 1000)
      }
    ],
    
    kuechenmanager: [
      {
        delay: 0,
        subject: 'Ihre Kostenkalkulation + KüchenManager Warenwirtschaft',
        template: 'kuechenmanager_welcome',
        scheduledFor: new Date(baseDate.getTime())
      },
      {
        delay: 24 * 60 * 60 * 1000,
        subject: 'LMIV-konforme Speisepläne automatisch erstellen',
        template: 'kuechenmanager_lmiv_benefits',
        scheduledFor: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)
      },
      {
        delay: 72 * 60 * 60 * 1000,
        subject: 'DATEV-Integration: So sparen Sie 5h Buchhaltung/Woche',
        template: 'kuechenmanager_datev_roi',
        scheduledFor: new Date(baseDate.getTime() + 72 * 60 * 60 * 1000)
      }
    ],
    
    ear: [
      {
        delay: 0,
        subject: 'Ihr Menü-Export + EAR Starterpakete',
        template: 'ear_welcome',
        scheduledFor: new Date(baseDate.getTime())
      },
      {
        delay: 24 * 60 * 60 * 1000,
        subject: 'Tourenplanung: Von 4h auf 30min reduzieren',
        template: 'ear_efficiency_benefits',
        scheduledFor: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)
      },
      {
        delay: 72 * 60 * 60 * 1000,
        subject: 'EAR Starterpaket M: Perfekt für 50-200 Kunden',
        template: 'ear_paket_recommendation',
        scheduledFor: new Date(baseDate.getTime() + 72 * 60 * 60 * 1000)
      }
    ]
  }

  return sequences[leadData.segment] || []
}

// Email Templates
export const emailTemplates = {
  webmenue_welcome: {
    subject: 'Ihre Speisekarte + WebMenü für Schulen & Kitas',
    html: `
      <h1>Vielen Dank für Ihr Interesse!</h1>
      <p>Hier ist Ihre Speisekarte als PDF-Download:</p>
      <p><a href="{PDF_DOWNLOAD_LINK}">📄 Speisekarte herunterladen</a></p>
      
      <hr style="margin: 30px 0;">
      
      <h2>💡 WebMenü - Digitale Schulverpflegung</h2>
      <p>Perfekt für Schulen, Kitas und Betriebe:</p>
      <ul>
        <li>📱 <strong>Online-Bestellung:</strong> Eltern bestellen per App oder Website</li>
        <li>💳 <strong>Bargeldlose Abrechnung:</strong> SEPA, Guthaben, Überweisungen</li>
        <li>🎓 <strong>BuT-Integration:</strong> Bildung & Teilhabe automatisch abrechnen</li>
        <li>📊 <strong>Warenwirtschaft:</strong> Exakte Bedarfsmengen, weniger Waste</li>
      </ul>
      
      <p><a href="{DEMO_LINK}">🚀 Kostenlose Demo vereinbaren</a></p>
      
      <p>Freundliche Grüße<br>Ihr GastroTools Team</p>
    `
  },
  
  kuechenmanager_welcome: {
    subject: 'Ihre Kostenkalkulation + KüchenManager Warenwirtschaft',
    html: `
      <h1>Professionelle Warenwirtschaft wartet auf Sie!</h1>
      <p>Ihre Kostenkalkulation als Download:</p>
      <p><a href="{CSV_DOWNLOAD_LINK}">📊 Kostenkalkulation herunterladen</a></p>
      
      <hr style="margin: 30px 0;">
      
      <h2>🍽️ KüchenManager - Für Profi-Küchen</h2>
      <ul>
        <li>📋 <strong>EU-konforme Nährwerte:</strong> LMIV-Compliance automatisch</li>
        <li>🖨️ <strong>Speiseplan-Druck:</strong> Allergenkennzeichnung professionell</li>
        <li>📦 <strong>Warenwirtschaft:</strong> Lager, Disposition, Lieferanten</li>
        <li>💰 <strong>DATEV-Integration:</strong> Fibu-Schnittstelle direkt</li>
      </ul>
      
      <p><strong>ROI-Garantie:</strong> Sparen Sie 10h/Woche Verwaltungsaufwand</p>
      <p><a href="{DEMO_LINK}">🚀 KüchenManager Demo anfordern</a></p>
    `
  },
  
  ear_welcome: {
    subject: 'Ihr Menü-Export + EAR Starterpakete', 
    html: `
      <h1>Essen auf Rädern - Digital & Effizient</h1>
      <p>Ihr Menü-Export:</p>
      <p><a href="{PDF_DOWNLOAD_LINK}">📄 Menü herunterladen</a></p>
      
      <hr style="margin: 30px 0;">
      
      <h2>🚚 EAR - Komplettlösung für Lieferdienste</h2>
      
      <h3>Starterpakete (transparente Preise):</h3>
      <ul>
        <li><strong>Starter S (€99/Monat):</strong> 50 Kunden, Basis-Touren</li>
        <li><strong>Professional M (€199/Monat):</strong> 200 Kunden, DATEV-Export</li>
        <li><strong>Enterprise L (€299/Monat):</strong> Unlimited, Web-Shop</li>
      </ul>
      
      <p>✅ 30 Tage kostenlos testen<br>
      ✅ Einrichtung & Schulung inklusive<br>
      ✅ DATEV/SEPA-Ready</p>
      
      <p><a href="{DEMO_LINK}">🚀 Starterpaket auswählen</a></p>
    `
  }
};