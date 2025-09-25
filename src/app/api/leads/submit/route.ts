import { NextRequest, NextResponse } from 'next/server'

interface LeadSubmission {
  email: string
  rolle: string
  orgTyp: string
  interesse: string[]
  source: string
  toolUsed: string
  exportType: string
  consent: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadSubmission = await request.json()
    
    // Validation
    if (!body.email || !body.rolle || !body.orgTyp || !body.consent) {
      return NextResponse.json(
        { error: 'Required fields missing: email, rolle, orgTyp, consent' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Detect primary segment
    const primarySegment = detectPrimarySegment(body.orgTyp, body.interesse)
    
    // Create lead record
    const leadData = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: body.email,
      name: '', // Will be enriched later
      company: '',
      rolle: body.rolle,
      orgTyp: body.orgTyp,
      interesse: body.interesse,
      primarySegment,
      source: body.source,
      toolUsed: body.toolUsed,
      exportType: body.exportType,
      status: 'new',
      createdAt: new Date().toISOString(),
      consent: body.consent,
      doubleOptIn: false // Will be set after email confirmation
    }

    // TODO: Save to database (for now, just log)
    console.log('📧 Lead captured:', leadData)

    // Send confirmation email with export
    const emailSent = await sendLeadConfirmationEmail(leadData)
    
    return NextResponse.json({
      success: true,
      leadId: leadData.id,
      primarySegment,
      emailSent,
      message: 'Lead erfolgreich erfasst. Check your email for export + next steps!'
    })

  } catch (error) {
    console.error('Lead submission error:', error)
    return NextResponse.json(
      { error: 'Lead submission failed' },
      { status: 500 }
    )
  }
}

function detectPrimarySegment(orgTyp: string, interesse: string[]): string {
  // Explicit interest wins
  if (interesse.includes('webmenue')) return 'webmenue'
  if (interesse.includes('kuechenmanager')) return 'kuechenmanager'  
  if (interesse.includes('ear')) return 'ear'
  
  // Fallback to org type detection
  if (orgTyp.includes('Schule') || orgTyp.includes('Kita') || orgTyp.includes('Betrieb')) {
    return 'webmenue'
  }
  
  if (orgTyp.includes('Senioren') || orgTyp.includes('Lieferservice')) {
    return 'ear'
  }
  
  return 'kuechenmanager' // Default for gastro professionals
}

async function sendLeadConfirmationEmail(leadData: any): Promise<boolean> {
  try {
    // TODO: Implement with Resend or similar
    // For now, simulate email sending
    
    const emailTemplate = generateEmailTemplate(leadData)
    
    // Log email for debugging
    console.log('📧 Email would be sent:', {
      to: leadData.email,
      subject: `Ihr ${leadData.exportType.toUpperCase()} Export + passende Profi-Tools`,
      preview: emailTemplate.substring(0, 100) + '...'
    })
    
    // Simulate successful email sending
    return true
    
  } catch (error) {
    console.error('Email sending error:', error)
    return false
  }
}

function generateEmailTemplate(leadData: any): string {
  const segmentInfo = getSegmentInfo(leadData.primarySegment)
  
  return `
Hallo,

vielen Dank für Ihr Interesse an GastroTools!

🎯 Ihr ${leadData.exportType.toUpperCase()} Export:
[Hier würde der Download-Link stehen]

💡 Basierend auf Ihrem Bereich (${leadData.orgTyp}) empfehlen wir:

${segmentInfo.name}
${segmentInfo.description}

✅ ${segmentInfo.features.join('\n✅ ')}

🚀 Nächste Schritte:
- Kostenlose Demo vereinbaren: ${segmentInfo.demoUrl}
- Mehr Infos: ${segmentInfo.infoUrl}

Freundliche Grüße
Ihr GastroTools Team

---
Sie erhalten diese E-Mail, weil Sie Ihr Interesse an unseren Profi-Tools bekundet haben.
Abmelden: [Unsubscribe-Link]
  `.trim()
}

function getSegmentInfo(segment: string) {
  switch (segment) {
    case 'webmenue':
      return {
        name: 'WebMenü - Digitale Schul- & Kitaverpflegung',
        description: 'Online-Bestellung, bargeldlose Abrechnung, BuT-Integration',
        features: [
          'Online-Bestellsystem für Eltern & Schüler', 
          'Bargeldlose Abrechnung (SEPA, Guthaben)',
          'BuT-Abrechnung automatisch',
          'App für iOS & Android',
          'Warenwirtschafts-Integration'
        ],
        demoUrl: 'https://ntc.software/demo/webmenue',
        infoUrl: 'https://ntc.software/produkte/ntc-webmenue.html'
      }
    case 'kuechenmanager':
      return {
        name: 'KüchenManager - Professionelle Warenwirtschaft',
        description: 'Rezepte, Speiseplandruck, Controlling für GV & Catering',
        features: [
          'Rezeptverwaltung mit Nährwerten',
          'Speiseplandruck mit Allergenen', 
          'Warenwirtschaft & Disposition',
          'Lager & Inventur',
          'Fibu-Schnittstellen (DATEV)'
        ],
        demoUrl: 'https://ntc.software/demo/kuechenmanager',
        infoUrl: 'https://ntc.software/produkte/ntc-kuechenmanager.html'
      }
    case 'ear':
      return {
        name: 'EAR - Essen auf Rädern Digital',
        description: 'Komplettlösung für Lieferdienste & Menübringdienste',
        features: [
          'Kundenverwaltung mit Rollen',
          'Online-Bestellsystem',
          'Tourenplanung & Etiketten',
          'Rechnungen & DATEV/SEPA Export',
          'Web-Shop Integration'
        ],
        demoUrl: 'https://essen-auf-raedern.eu/demo',
        infoUrl: 'https://essen-auf-raedern.eu'
      }
    default:
      return {
        name: 'GastroTools Professional',
        description: 'Professionelle Gastronomie-Software',
        features: ['Vollständige Restaurant-Verwaltung'],
        demoUrl: 'https://ntc.software/demo',
        infoUrl: 'https://ntc.software'
      }
  }
}