import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import QRCode from 'qrcode'

export async function generateQRCode(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
  } catch (error) {
    console.error('QR Code generation failed:', error)
    throw new Error('QR Code generation failed')
  }
}

export async function generateMenuPDF(elementId: string, filename: string = 'menu.pdf'): Promise<void> {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error('Menu element not found')
    }

    // Generate canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff'
    })

    // Create PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')

    const imgWidth = 210 // A4 width in mm
    const pageHeight = 295 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Download PDF
    pdf.save(filename)
  } catch (error) {
    console.error('PDF generation failed:', error)
    throw new Error('PDF generation failed')
  }
}

export function getMenuPreviewUrl(menuId: string): string {
  return `/speisekarten-designer/preview/${menuId}`
}

export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(numPrice)
}

export function validateMenuData(data: any): boolean {
  if (!data || typeof data !== 'object') return false
  if (!data.title || typeof data.title !== 'string') return false
  if (!Array.isArray(data.sections)) return false

  return data.sections.every((section: any) =>
    section.title &&
    Array.isArray(section.items) &&
    section.items.every((item: any) =>
      item.name &&
      typeof item.price !== 'undefined'
    )
  )
}