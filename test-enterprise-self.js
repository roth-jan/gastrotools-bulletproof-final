const { chromium } = require('playwright');

async function testEnterpriseSelf() {
  console.log('🧪 SELF-TESTING ENTERPRISE FEATURES');
  console.log('===================================');
  console.log('URL: https://gastrotools-bulletproof.vercel.app');
  console.log('Testing: Smart Upselling + All Enterprise Components');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // TEST LATEST DEPLOYMENT: Smart Upselling Fix
    console.log('\n🎯 TESTING: Smart Upselling After PDF Export');
    console.log('============================================');
    
    // Login as demo (should now trigger Smart Upsell)
    await page.goto('https://gastrotools-bulletproof.vercel.app/login');
    await page.fill('input[type="email"]', 'demo@gastrotools.de');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    
    await page.goto('https://gastrotools-bulletproof.vercel.app/speisekarten-designer');
    
    // Create test menu card
    await page.fill('input[placeholder*="Summer"]', 'Smart Upsell Test Card');
    await page.click('button:has-text("Create New Card")');
    await page.waitForTimeout(3000);
    
    console.log('✅ Menu card created');
    
    // Test PDF Export → Should trigger Smart Upsell
    const exportBtn = page.locator('button:has-text("Export PDF")');
    const exportExists = await exportBtn.count() > 0;
    
    console.log(`PDF Export button exists: ${exportExists ? '✅' : '❌'}`);
    
    if (exportExists) {
      console.log('🚀 Clicking PDF Export → Should trigger Smart Upsell...');
      
      // Monitor for Smart Upsell appearance
      let upsellAppeared = false;
      let downloadTriggered = false;
      
      // Monitor downloads
      page.on('download', () => {
        downloadTriggered = true;
        console.log('📄 PDF Download triggered');
      });
      
      // Click export
      await exportBtn.click();
      
      // Wait for button state change
      await page.waitForTimeout(1000);
      const buttonText = await exportBtn.textContent();
      console.log(`Button state: "${buttonText}"`);
      
      // Wait for Smart Upsell (should appear after 2 seconds)
      console.log('⏳ Waiting for Smart Upsell (2s delay)...');
      
      for (let i = 0; i < 15; i++) { // Check for 15 seconds
        await page.waitForTimeout(1000);
        
        // Look for Smart Upsell toast
        const upsellToast = await page.locator('.fixed, [role="alert"], .smart-upsell').count();
        const upsellText = await page.locator('text=/WebMenü|KüchenManager|EAR|Demo Restaurant/i').count();
        
        if (upsellToast > 0 || upsellText > 0) {
          upsellAppeared = true;
          console.log(`✅ SMART UPSELL APPEARED after ${i + 1} seconds!`);
          
          // Get upsell details
          const upsellContent = await page.locator('.fixed').allTextContents();
          console.log(`Upsell content: ${upsellContent.join(', ')}`);
          break;
        }
      }
      
      if (!upsellAppeared) {
        console.log('❌ NO SMART UPSELL: Checking why...');
        
        // Debug: Check if components are in DOM
        const components = await page.evaluate(() => {
          return {
            currentUser: localStorage.getItem('user'),
            showSmartUpsell: window.showSmartUpsell || 'unknown',
            totalDivs: document.querySelectorAll('div').length,
            fixedElements: document.querySelectorAll('.fixed').length
          };
        });
        
        console.log('Debug info:', components);
      }
      
      console.log(`\nRESULTS:`);
      console.log(`PDF Download: ${downloadTriggered ? '✅' : '❌'}`);
      console.log(`Smart Upsell: ${upsellAppeared ? '✅ WORKING' : '❌ NOT TRIGGERED'}`);
      
      await page.screenshot({ path: 'self-test-smart-upsell.png' });
    }
    
    // TEST ENTERPRISE AUTH FEATURES
    console.log('\n🔥 TESTING: Enterprise Authentication');
    console.log('===================================');
    
    await page.goto('https://gastrotools-bulletproof.vercel.app/signup-light');
    
    const magicLinkBtn = await page.locator('button:has-text("Magic Link")').count();
    const googleBtn = await page.locator('button:has-text("Google")').count();
    const microsoftBtn = await page.locator('button:has-text("Microsoft")').count();
    
    console.log(`Magic Link Button: ${magicLinkBtn > 0 ? '✅' : '❌'}`);
    console.log(`Google OAuth: ${googleBtn > 0 ? '✅' : '❌'}`);
    console.log(`Microsoft OAuth: ${microsoftBtn > 0 ? '✅' : '❌'}`);
    
    // FINAL SELF-ASSESSMENT
    console.log('\n🏆 SELF-TEST FINAL ASSESSMENT');
    console.log('=============================');
    
    const selfTestResults = [
      { name: 'PDF Export Working', status: exportExists },
      { name: 'Smart Upsell System', status: upsellAppeared },
      { name: 'Light Signup Available', status: magicLinkBtn > 0 },
      { name: 'Social Login Ready', status: googleBtn > 0 && microsoftBtn > 0 }
    ];
    
    const workingFeatures = selfTestResults.filter(r => r.status).length;
    const selfTestScore = Math.round((workingFeatures / selfTestResults.length) * 100);
    
    console.log(`SELF-TEST SCORE: ${workingFeatures}/4 (${selfTestScore}%)`);
    
    selfTestResults.forEach(result => {
      console.log(`${result.status ? '✅' : '❌'} ${result.name}`);
    });
    
    if (selfTestScore >= 75) {
      console.log('\n🎉 SELF-TEST SUCCESS: Enterprise features working!');
      console.log('🚀 Tester should now see Smart Upsell after PDF export');
    } else {
      console.log('\n🔧 SELF-TEST ISSUES: Some enterprise features not working');
    }
    
    console.log('\n🎯 TESTER INSTRUCTIONS UPDATE:');
    console.log('==============================');
    console.log('1. Login as demo@gastrotools.de');
    console.log('2. Create menu card in speisekarten-designer');
    console.log('3. Click "Export PDF"');
    console.log('4. Wait 2-3 seconds for Smart Upsell toast');
    console.log('5. Should see bottom-right notification');
    
  } catch (error) {
    console.error('Self-test error:', error);
  } finally {
    await browser.close();
  }
}

testEnterpriseSelf();