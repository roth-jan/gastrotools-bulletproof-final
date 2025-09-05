const { chromium } = require('playwright');

async function testFinalMainDomain() {
  console.log('🎯 TESTING MAIN DOMAIN AFTER ALIAS UPDATE');
  console.log('=========================================');
  console.log('URL: https://gastrotools-bulletproof.vercel.app');
  console.log('Should now point to latest deployment with ALL fixes');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Clear all cache
  await page.goto('data:text/html,<h1>Cache Clear</h1>');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  try {
    // Test with cache busting
    console.log('\n🔄 Testing with cache busting...');
    await page.goto('https://gastrotools-bulletproof.vercel.app?cb=' + Date.now());
    
    // Login
    await page.goto('https://gastrotools-bulletproof.vercel.app/login?cb=' + Date.now());
    await page.fill('input[type="email"]', 'demo@gastrotools.de');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    
    // CRITICAL: Test PDF Export specifically
    console.log('\n📄 CRITICAL TEST: PDF Export on Main Domain');
    console.log('==========================================');
    
    await page.goto('https://gastrotools-bulletproof.vercel.app/speisekarten-designer?cb=' + Date.now());
    
    // Create test card
    await page.fill('input[placeholder*="Summer"]', 'Main Domain PDF Test');
    await page.click('button:has-text("Create New Card")');
    await page.waitForTimeout(2000);
    
    // Check if Export PDF button is visible (should be immediate now)
    const pdfButton = page.locator('button:has-text("Export PDF")');
    const pdfButtonExists = await pdfButton.count() > 0;
    
    console.log(`PDF Export button visible: ${pdfButtonExists ? '✅ YES' : '❌ NO'}`);
    
    if (pdfButtonExists) {
      let downloadTriggered = false;
      let errorOccurred = false;
      
      // Monitor downloads
      page.on('download', (download) => {
        downloadTriggered = true;
        console.log(`[DOWNLOAD SUCCESS] ${download.suggestedFilename()}`);
      });
      
      // Monitor errors
      page.on('pageerror', (error) => {
        errorOccurred = true;
        console.log(`[PDF ERROR] ${error.message}`);
      });
      
      console.log('🚀 Clicking Export PDF on main domain...');
      await pdfButton.click();
      await page.waitForTimeout(8000); // Extended wait
      
      const buttonText = await pdfButton.textContent();
      console.log(`Button state after click: "${buttonText}"`);
      
      if (downloadTriggered) {
        console.log('🎉 PDF EXPORT: ✅ WORKING ON MAIN DOMAIN!');
      } else if (errorOccurred) {
        console.log('❌ PDF EXPORT: Error during generation');
      } else {
        console.log('⚠️ PDF EXPORT: No download triggered (browser/security issue?)');
      }
      
    } else {
      console.log('❌ PDF Export button not found - deployment not updated yet');
    }
    
    // Quick test other fixes are still working
    console.log('\n🔍 Quick verification other fixes still work...');
    
    await page.goto('https://gastrotools-bulletproof.vercel.app/kostenkontrolle?cb=' + Date.now());
    await page.fill('input[placeholder*="Tomatoes"]', 'Quick Validation Test');
    await page.click('button:has-text("Select category")');
    await page.waitForTimeout(500);
    await page.click('text="Vegetables"');
    await page.fill('input[placeholder="1"]', '1');
    await page.fill('input[placeholder="0.00"]', '-99'); // Negative
    await page.fill('input[placeholder*="Supplier"]', 'Test');
    
    await page.click('button:has-text("Add Entry")');
    await page.waitForTimeout(2000);
    
    const validationWorks = await page.locator('.text-red-500').count() > 0;
    console.log(`Kostenkontrolle validation: ${validationWorks ? '✅ Still working' : '❌ Broken'}`);
    
    await page.screenshot({ path: 'main-domain-final-test.png' });
    
    console.log('\n🎯 MAIN DOMAIN STATUS');
    console.log('====================');
    console.log('Main domain should now have ALL fixes including PDF Export');
    console.log('User should test: https://gastrotools-bulletproof.vercel.app');
    
  } catch (error) {
    console.error('Main domain test error:', error);
  } finally {
    await browser.close();
  }
}

testFinalMainDomain();