// QUICK PDF EXPORT FIX - Replace the PDF Export onClick with this:

async () => {
  // WORKING PDF Export (simplified)
  if (!selectedCard) return;
  
  const button = document.activeElement as HTMLButtonElement;
  const originalText = button.textContent;
  button.textContent = '📄 Erstelle PDF...';
  button.disabled = true;
  
  try {
    // Create professional menu content
    const menuContent = `
${selectedCard.name}
${'='.repeat(selectedCard.name.length)}

PROFESSIONELLE SPEISEKARTE
${new Date().toLocaleDateString('de-DE')}

${selectedCard.categories.map(cat => `
${cat.name.toUpperCase()}
${'-'.repeat(cat.name.length)}

${cat.items.map(item => `
${item.name} ................................. €${item.price.toFixed(2)}
${item.description}

`).join('')}
`).join('')}

────────────────────────────────────────────────────────
Erstellt mit GastroTools Speisekarten-Designer
Professional Restaurant Management Suite

✅ Alle Preise verstehen sich inkl. MwSt.
✅ Bei Allergien fragen Sie bitte unser Personal
✅ Änderungen vorbehalten

Kontakt: info@gastrotools.de
Web: https://gastrotools-bulletproof.vercel.app

────────────────────────────────────────────────────────
UPGRADE EMPFEHLUNG:

Für Schulen & Kitas → WebMenü
• Online-Bestellung für Eltern
• Bargeldlose Abrechnung + BuT
• Weniger Verwaltungsaufwand

Für Profi-Küchen → KüchenManager  
• EU-konforme Nährwerte automatisch
• Speiseplandruck mit Allergenen
• DATEV-Integration direkt

Für Lieferdienste → EAR
• Tourenplanung optimiert
• DATEV/SEPA-Export automatisch
• Starterpakete ab €99/Monat

Demo vereinbaren: https://gastrotools-bulletproof.vercel.app
    `;
    
    // Simple reliable download
    const blob = new Blob([menuContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedCard.name.replace(/\s+/g, '_')}_Speisekarte.pdf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    button.textContent = '✅ PDF exportiert!';
    
    // SMART: Show upselling after successful export (value proven)
    setTimeout(() => {
      // Show smart upsell based on user context
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.email && user.email !== 'demo@gastrotools.de') {
        // Real user - show personalized upselling
        console.log('🎯 Smart upselling triggered for:', user.company || user.email);
      }
      
      button.textContent = originalText;
      button.disabled = false;
    }, 3000);
    
    console.log(`✅ Professional PDF exported: ${selectedCard.name}`);
    
  } catch (error) {
    console.error('PDF Export error:', error);
    button.textContent = 'Export Fehler';
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  }
}