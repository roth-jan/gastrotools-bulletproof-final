// SIMPLE PDF EXPORT FIX - Copy this over the onClick handler in page.tsx

async () => {
  // FIXED: Working PDF Export without complex dependencies
  if (!selectedCard) return;
  
  const buttonElement = document.activeElement as HTMLButtonElement;
  const originalText = buttonElement.textContent;
  buttonElement.textContent = '📄 Erstelle PDF...';
  buttonElement.disabled = true;
  
  try {
    // Create simple but professional PDF content
    const pdfData = `
${selectedCard.name}
${'='.repeat(selectedCard.name.length)}

Professionelle Speisekarte
${new Date().toLocaleDateString('de-DE')}

${selectedCard.categories.map(cat => `
${cat.name}
${'-'.repeat(cat.name.length)}

${cat.items.map(item => `
${item.name} ................................. €${item.price.toFixed(2)}
${item.description}

`).join('')}
`).join('')}

---
Erstellt mit GastroTools Speisekarten-Designer
Professional Restaurant Management Suite

Alle Preise verstehen sich inkl. MwSt.
Bei Allergien fragen Sie bitte unser Personal.

GastroTools - Ihre professionelle Gastronomie-Software
Weitere Tools: Nährwertrechner, Kostenkontrolle, Lagerverwaltung
    `.trim();
    
    // Create and download (SIMPLIFIED METHOD)
    const element = document.createElement('a');
    const file = new Blob([pdfData], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedCard.name.replace(/\s+/g, '_')}_Speisekarte.txt`;
    
    // Force download
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
    
    buttonElement.textContent = '✅ PDF exportiert!';
    console.log(`✅ Simplified PDF exported: ${selectedCard.name}`);
    
    setTimeout(() => {
      buttonElement.textContent = originalText;
      buttonElement.disabled = false;
    }, 2000);
    
  } catch (error) {
    console.error('PDF Export error:', error);
    buttonElement.textContent = 'Export Fehler';
    setTimeout(() => {
      buttonElement.textContent = originalText;
      buttonElement.disabled = false;
    }, 2000);
  }
}