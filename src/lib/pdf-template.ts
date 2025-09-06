export function generateProfessionalMenuHTML(menuCard: any): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${menuCard.name} - Speisekarte</title>
  <style>
    @page { margin: 2cm; size: A4; }
    body { 
      font-family: 'Georgia', serif; 
      line-height: 1.6; 
      color: #333; 
      max-width: 800px; 
      margin: 0 auto;
      background: white;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #8b5a3c;
      padding-bottom: 30px;
      margin-bottom: 40px;
    }
    .title {
      font-size: 2.5rem;
      font-weight: bold;
      color: #2c1810;
      margin-bottom: 10px;
      letter-spacing: 1px;
    }
    .subtitle {
      font-size: 1.2rem;
      color: #8b5a3c;
      font-style: italic;
    }
    .category {
      margin-bottom: 40px;
    }
    .category-title {
      font-size: 1.8rem;
      color: #2c1810;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #d4af37;
      text-align: center;
      font-weight: bold;
    }
    .menu-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding: 15px 0;
      border-bottom: 1px dotted #ccc;
    }
    .item-info {
      flex: 1;
      padding-right: 30px;
    }
    .item-name {
      font-size: 1.1rem;
      font-weight: bold;
      color: #2c1810;
      margin-bottom: 5px;
    }
    .item-description {
      color: #666;
      font-style: italic;
      font-size: 0.9rem;
    }
    .item-price {
      font-size: 1.2rem;
      font-weight: bold;
      color: #8b5a3c;
      white-space: nowrap;
    }
    .footer {
      text-align: center;
      margin-top: 60px;
      padding-top: 30px;
      border-top: 2px solid #8b5a3c;
      color: #666;
      font-size: 0.8rem;
    }
    .print-hint {
      background: #e3f2fd;
      border: 1px solid #2196f3;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: center;
    }
    @media print {
      .print-hint { display: none; }
      body { margin: 0; }
    }
  </style>
</head>
<body>
  <div class="print-hint">
    <strong>💡 So erstellen Sie eine PDF:</strong><br>
    Drücken Sie <strong>Ctrl+P</strong> (oder Cmd+P) → Wählen Sie "Als PDF speichern" → Klicken Sie "Speichern"
  </div>
  
  <div class="header">
    <h1 class="title">${menuCard.name}</h1>
    <p class="subtitle">Speisekarte</p>
  </div>
  
  ${menuCard.categories.map(category => `
    <div class="category">
      <h2 class="category-title">${category.name}</h2>
      ${category.items.map(item => `
        <div class="menu-item">
          <div class="item-info">
            <div class="item-name">${item.name}</div>
            <div class="item-description">${item.description}</div>
          </div>
          <div class="item-price">€${item.price.toFixed(2)}</div>
        </div>
      `).join('')}
    </div>
  `).join('')}
  
  <div class="footer">
    <p><strong>Alle Preise verstehen sich inkl. der gesetzlichen Mehrwertsteuer</strong></p>
    <p>Bei Allergien und Unverträglichkeiten fragen Sie bitte unser Personal</p>
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
    <p><strong>Erstellt mit GastroTools Speisekarten-Designer</strong></p>
    <p>${new Date().toLocaleDateString('de-DE')} • Professionelle Gastronomie-Software</p>
    <p style="font-size: 0.7rem; margin-top: 10px;">
      🌐 https://gastrotools-bulletproof.vercel.app<br>
      📧 Mehr Profi-Tools: WebMenü, KüchenManager, EAR
    </p>
  </div>
</body>
</html>`
}