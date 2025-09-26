const { chromium } = require('playwright');

async function debugPDFExportIssue() {
  console.log('🔍 DEBUGGING PDF EXPORT DOWNLOAD ISSUE');
  console.log('======================================');
  console.log('Problem: Button shows, loading state works, but no download');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture ALL console messages for debugging
  page.on('console', msg => console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`));
  page.on('pageerror', error => console.log(`[PAGE ERROR] ${error.message}`));
  
  try {
    const baseUrl = 'https://gastrotools-bulletproof-795lqacmm-jhroth-7537s-projects.vercel.app';
    
    await page.goto(`${baseUrl}/login`);
    await page.fill('input[type="email"]', 'demo@gastrotools.de');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    await page.goto(`${baseUrl}/speisekarten-designer`);
    
    // Create test card
    await page.fill('input[placeholder*="Summer"]', 'PDF Debug Test Card');
    await page.click('button:has-text("Create New Card")');
    await page.waitForTimeout(2000);
    
    console.log('\n1. 📄 Pre-Export Analysis');
    console.log('========================');
    
    const exportBtn = page.locator('button:has-text("Export PDF")');
    const btnExists = await exportBtn.count() > 0;
    
    console.log(`Export button exists: ${btnExists ? '✅ YES' : '❌ NO'}`);
    
    if (btnExists) {
      // Check if html2canvas and jsPDF are available in browser
      const librariesAvailable = await page.evaluate(async () => {
        try {
          // Test if dynamic imports work
          const html2canvas = await import('html2canvas');
          const jsPDF = await import('jspdf');
          
          return {
            html2canvas: !!html2canvas.default,
            jsPDF: !!jsPDF.default,
            error: null
          };
        } catch (error) {
          return {
            html2canvas: false,
            jsPDF: false,
            error: error.message
          };
        }
      });
      
      console.log(`html2canvas available: ${librariesAvailable.html2canvas ? '✅' : '❌'}`);
      console.log(`jsPDF available: ${librariesAvailable.jsPDF ? '✅' : '❌'}`);
      if (librariesAvailable.error) {
        console.log(`Library error: ${librariesAvailable.error}`);
      }
      
      console.log('\n2. 🧪 PDF Export Attempt');
      console.log('========================');
      
      let downloadDetected = false;
      let errorDetected = false;
      
      // Monitor downloads
      page.on('download', (download) => {
        downloadDetected = true;
        console.log(`[SUCCESS] Download detected: ${download.suggestedFilename()}`);
      });
      
      // Click export and monitor what happens
      console.log('Clicking Export PDF button...');
      await exportBtn.click();
      
      // Wait and see what happens
      await page.waitForTimeout(8000); // Longer wait for PDF generation
      
      console.log(`Download detected: ${downloadDetected ? '✅ SUCCESS' : '❌ FAILED'}`);
      
      // Check if button returned to normal state
      const buttonText = await exportBtn.textContent();
      console.log(`Button state after click: "${buttonText}"`);
      
      // If download failed, check for errors in browser
      if (!downloadDetected) {
        console.log('\n3. 🔍 Error Analysis');
        console.log('===================');
        
        const browserErrors = await page.evaluate(() => {
          // Check for any unhandled promise rejections or errors
          return {
            userAgent: navigator.userAgent,
            errors: window.console.errors || [],
            lastError: window.lastError || null
          };
        });
        
        console.log('Browser info:', browserErrors.userAgent);
        console.log('Browser errors:', browserErrors.errors);
        
        // Test if basic blob download works
        const basicBlobWorks = await page.evaluate(() => {
          try {
            const blob = new Blob(['test'], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'test.txt';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            return true;
          } catch (error) {
            console.log('Basic blob error:', error.message);
            return false;
          }
        });
        
        console.log(`Basic blob download works: ${basicBlobWorks ? '✅' : '❌'}`);
      }
    }
    
    await page.screenshot({ path: 'pdf-export-debug-final.png' });
    
  } catch (error) {
    console.error('PDF export debug error:', error);
  } finally {
    await browser.close();
  }
}

debugPDFExportIssue();