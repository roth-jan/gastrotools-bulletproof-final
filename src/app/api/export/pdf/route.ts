import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { menuCard, userId } = await request.json()
    
    if (!menuCard || !menuCard.name) {
      return NextResponse.json(
        { error: 'Menu card data required' },
        { status: 400 }
      )
    }

    // Generate PDF content (simplified for deterministic testing)
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
    const slug = menuCard.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const filename = `MENU_${slug}_${timestamp}.pdf`
    
    // Simple PDF-like content (in production: use puppeteer/jspdf)
    const pdfContent = generatePDFContent(menuCard)
    
    // Log export event
    console.log('📄 PDF Export:', {
      userId,
      filename,
      menuName: menuCard.name,
      categories: menuCard.categories?.length || 0,
      timestamp: new Date().toISOString()
    })

    // Return proper PDF response
    const response = new NextResponse(pdfContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Export-Success': 'true',
        'X-Filename': filename
      }
    })
    
    return response

  } catch (error) {
    console.error('PDF Export error:', error)
    
    return NextResponse.json(
      { 
        error: 'PDF generation failed',
        fallback: 'Download als Text verfügbar - kopieren Sie Inhalt in Word für PDF'
      },
      { status: 500 }
    )
  }
}

function generatePDFContent(menuCard: any): Buffer {
  // Simple PDF-header simulation for testing
  // In production: use puppeteer or jsPDF server-side
  const textContent = `${menuCard.name}
${'='.repeat(menuCard.name.length)}

PROFESSIONELLE SPEISEKARTE
${new Date().toLocaleDateString('de-DE')}

${menuCard.categories?.map((cat: any) => `
${cat.name.toUpperCase()}
${'-'.repeat(cat.name.length)}

${cat.items?.map((item: any) => `${item.name} ................................. €${item.price?.toFixed(2)}
${item.description}

`).join('') || ''}`).join('') || ''}

────────────────────────────────────────────────────────
Erstellt mit GastroTools Speisekarten-Designer
Professional Restaurant Management Suite

✅ Alle Preise verstehen sich inkl. MwSt.
✅ Bei Allergien fragen Sie bitte unser Personal

Kontakt: info@gastrotools.de
${new Date().toLocaleDateString('de-DE')} • Ihre professionelle Gastronomie-Software
`

  // Return as buffer (in production: real PDF buffer)
  return Buffer.from(textContent, 'utf-8')
}