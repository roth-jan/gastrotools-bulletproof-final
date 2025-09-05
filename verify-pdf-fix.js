const { chromium } = require('playwright');

async function verifyPDFFix() {
  console.log('📄 VERIFYING PDF EXPORT FIX');
  console.log('===========================');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Test on latest deployment URL
    const testUrl = 'https://gastrotools-bulletproof-3bjp0vhu5-jhroth-7537s-projects.vercel.app';
    console.log(`Testing URL: ${testUrl}`);
    
    await page.goto(`${testUrl}/login`);
    await page.fill('input[type="email"]', 'demo@gastrotools.de');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    
    await page.goto(`${testUrl}/speisekarten-designer`);
    
    // Create a menu card to enable PDF export
    await page.fill('input[placeholder*="Summer"]', 'PDF Fix Verification Card');
    await page.click('button:has-text("Create New Card")');
    await page.waitForTimeout(3000);
    
    // Check if PDF Export button is present  
    const exportBtn = page.locator('button:has-text("Export PDF")');
    const btnExists = await exportBtn.count() > 0;
    
    console.log(`PDF Export button exists: ${btnExists ? '✅ YES' : '❌ NO'}`);
    
    if (btnExists) {
      // Check button functionality
      let downloadTriggered = false;
      let alertTriggered = false;
      
      // Monitor downloads
      page.on('download', (download) => {
        downloadTriggered = true;
        console.log(`✅ DOWNLOAD TRIGGERED: ${download.suggestedFilename()}`);
      });
      
      // Monitor alerts (old behavior)
      page.on('dialog', async (dialog) => {
        alertTriggered = true;
        console.log(`⚠️ ALERT TRIGGERED: ${dialog.message()}`);
        await dialog.accept();
      });
      
      // Click export button
      console.log('🧪 Clicking PDF Export button...');
      await exportBtn.click();
      await page.waitForTimeout(8000); // Wait for either download or alert
      
      if (downloadTriggered) {
        console.log('🎉 PDF EXPORT FIX: ✅ SUCCESSFUL - Real download working!');
      } else if (alertTriggered) {
        console.log('❌ PDF EXPORT FIX: Not deployed yet - still shows alert');
      } else {
        console.log('⚠️ PDF EXPORT: Unknown behavior - investigating...');
        
        // Check console for any errors
        const logs = await page.evaluate(() => {
          // Return any console logs or errors
          return window.console.errors || [];
        });
        
        console.log(`Console logs: ${logs.length}`);
      }
      
    } else {
      console.log('❌ PDF Export button not found - deployment issue');
    }
    
    await page.screenshot({ path: 'pdf-fix-verification.png' });
    
    // Also test main bulletproof URL
    console.log('\n🔄 Testing main bulletproof URL for comparison...');
    await page.goto('https://gastrotools-bulletproof.vercel.app/speisekarten-designer');
    
    const mainUrlBtn = page.locator('button:has-text("Export PDF")');
    const mainBtnExists = await mainUrlBtn.count() > 0;
    console.log(`Main URL PDF button: ${mainBtnExists ? '✅ Present' : '❌ Missing'}`);
    
  } catch (error) {
    console.error('PDF verification error:', error);
  } finally {
    await browser.close();
  }
}

verifyPDFFix();