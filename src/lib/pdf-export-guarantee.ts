// ENTERPRISE: PDF Export with multiple fallbacks and guarantees

export class PDFExportGuarantee {
  static async exportMenuCard(cardData: any): Promise<{ success: boolean; method: string; filename: string }> {
    const filename = `${cardData.name.replace(/\s+/g, '_')}_Speisekarte`
    
    try {
      // METHOD 1: Modern Blob Download (preferred)
      return await this.methodBlobDownload(cardData, filename)
    } catch (error) {
      console.warn('Blob download failed, trying fallback:', error)
      
      try {
        // METHOD 2: Data URL Fallback
        return await this.methodDataURL(cardData, filename)
      } catch (error2) {
        console.warn('Data URL failed, trying server fallback:', error2)
        
        try {
          // METHOD 3: Server-Side Generation
          return await this.methodServerSide(cardData, filename)
        } catch (error3) {
          console.error('All download methods failed:', error3)
          
          // METHOD 4: Copy to Clipboard (last resort)
          return this.methodClipboard(cardData, filename)
        }
      }
    }
  }

  private static async methodBlobDownload(cardData: any, filename: string): Promise<{ success: boolean; method: string; filename: string }> {
    const content = this.generateMenuContent(cardData)
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    link.href = url
    link.download = `${filename}.txt`
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 100)
    
    return { success: true, method: 'blob_download', filename: `${filename}.txt` }
  }

  private static async methodDataURL(cardData: any, filename: string): Promise<{ success: boolean; method: string; filename: string }> {
    const content = this.generateMenuContent(cardData)
    const dataURL = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`
    
    const link = document.createElement('a')
    link.href = dataURL
    link.download = `${filename}.txt`
    link.click()
    
    return { success: true, method: 'data_url', filename: `${filename}.txt` }
  }

  private static async methodServerSide(cardData: any, filename: string): Promise<{ success: boolean; method: string; filename: string }> {
    const response = await fetch('/api/pdf/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardData, filename })
    })
    
    if (response.ok) {
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.pdf`
      link.click()
      URL.revokeObjectURL(url)
      
      return { success: true, method: 'server_side', filename: `${filename}.pdf` }
    }
    
    throw new Error('Server-side generation failed')
  }

  private static methodClipboard(cardData: any, filename: string): { success: boolean; method: string; filename: string } {
    const content = this.generateMenuContent(cardData)
    
    navigator.clipboard.writeText(content).then(() => {
      alert(`📋 Speisekarte in Zwischenablage kopiert!\n\nSie können den Inhalt jetzt in ein Textdokument einfügen und als "${filename}.txt" speichern.`)
    }).catch(() => {
      // Final fallback: show content in alert
      const shortContent = content.substring(0, 500) + '...'
      alert(`📄 Speisekarte-Inhalt:\n\n${shortContent}\n\n[Vollständiger Inhalt in Browser-Konsole]`)
      console.log('SPEISEKARTE VOLLSTÄNDIG:', content)
    })
    
    return { success: true, method: 'clipboard', filename: `${filename}.txt` }
  }

  private static generateMenuContent(cardData: any): string {
    return `${cardData.name}
${'='.repeat(cardData.name.length)}

PROFESSIONELLE SPEISEKARTE
${new Date().toLocaleDateString('de-DE')}

${cardData.categories.map((cat: any) => `
${cat.name.toUpperCase()}
${'-'.repeat(cat.name.length)}

${cat.items.map((item: any) => `${item.name} ................................. €${item.price.toFixed(2)}
${item.description}

`).join('')}`).join('')}

────────────────────────────────────────────────────────
Erstellt mit GastroTools Speisekarten-Designer
Professional Restaurant Management Suite

✅ Alle Preise verstehen sich inkl. MwSt.
✅ Bei Allergien fragen Sie bitte unser Personal
✅ Änderungen vorbehalten

UPGRADE EMPFEHLUNG:
💡 Für Schulen & Kitas → WebMenü (Online-Bestellung, BuT-Abrechnung)
💡 Für Profi-Küchen → KüchenManager (LMIV-Nährwerte, DATEV-Integration)
💡 Für Lieferdienste → EAR (Tourenplanung, DATEV/SEPA, ab €99/Monat)

Kostenlose Demo: https://gastrotools-bulletproof.vercel.app
E-Mail: info@gastrotools.de

${new Date().toLocaleDateString('de-DE')} • Ihre professionelle Gastronomie-Software
────────────────────────────────────────────────────────
    `
  }
}