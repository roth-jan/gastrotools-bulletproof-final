const { chromium } = require('playwright');

async function testUpsellDebug() {
  console.log('🔍 DEBUGGING: Can I see Smart Upsell?');
  console.log('====================================');
  console.log('Testing EXACT same steps as human tester');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable detailed console logging
  page.on('console', msg => {
    if (msg.text().includes('Smart') || msg.text().includes('Upsell') || msg.text().includes('PDF')) {
      console.log(`[BROWSER] ${msg.text()}`);
    }
  });
  
  try {
    // EXACT TESTER STEPS
    console.log('\n1. 🔄 Hard Refresh + Login');
    console.log('==========================');
    
    // Hard refresh equivalent
    await page.goto('https://gastrotools-bulletproof.vercel.app?cb=' + Date.now());
    console.log('✅ Hard refresh done');
    
    // Login as demo
    await page.goto('https://gastrotools-bulletproof.vercel.app/login');
    await page.fill('input[type="email"]', 'demo@gastrotools.de');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    console.log('✅ Logged in as demo');
    
    console.log('\n2. 📄 PDF Export Test (Exact Steps)');
    console.log('==================================');
    
    await page.goto('https://gastrotools-bulletproof.vercel.app/speisekarten-designer');
    
    // Create new menu card
    await page.fill('input[placeholder*="Summer"]', 'Debug Upsell Test');
    await page.click('button:has-text("Create New Card")');
    await page.waitForTimeout(3000);
    console.log('✅ New menu card created');
    
    // Click Export PDF
    const exportBtn = page.locator('button:has-text("Export PDF")');
    console.log('🚀 Clicking Export PDF button...');
    
    await exportBtn.click();
    
    // Monitor button state changes
    await page.waitForTimeout(500);
    const buttonAfterClick = await exportBtn.textContent();
    console.log(`Button after click: "${buttonAfterClick}"`);
    
    // Wait and monitor for Smart Upsell
    console.log('⏳ Monitoring for Smart Upsell (15 second watch)...');
    
    let upsellFound = false;
    
    for (let second = 1; second <= 15; second++) {
      await page.waitForTimeout(1000);
      
      // Check multiple ways for upsell
      const fixedElements = await page.locator('.fixed').count();
      const alertElements = await page.locator('[role="alert"]').count(); 
      const upsellText = await page.locator('text=/Match|WebMenü|KüchenManager|Restaurant/i').count();
      
      if (fixedElements > 1 || alertElements > 0 || upsellText > 0) {
        upsellFound = true;
        console.log(`✅ UPSELL DETECTED at ${second}s!`);
        
        // Get all fixed element content
        const allFixed = await page.locator('.fixed').allTextContents();
        console.log(`Fixed elements: ${allFixed.join(' | ')}`);
        
        // Get specific upsell content
        const upsellContent = await page.locator('text=/Match|WebMenü|KüchenManager/i').allTextContents();
        console.log(`Upsell content: ${upsellContent.join(', ')}`);
        
        break;
      }
      
      if (second % 5 === 0) {
        console.log(`   ...${second}s - still waiting...`);
      }
    }
    
    console.log(`\nFINAL UPSELL RESULT: ${upsellFound ? '✅ I CAN SEE IT' : '❌ I CANNOT SEE IT'}`);
    
    // DEBUG: Check page source for upsell components
    if (!upsellFound) {
      console.log('\n🔍 DEBUGGING: Why no upsell?');
      console.log('=============================');
      
      const pageSource = await page.content();
      const hasUpsellComponent = pageSource.includes('SmartUpsell');
      const hasShowUpsell = pageSource.includes('showSmartUpsell');
      
      console.log(`Page contains SmartUpsell component: ${hasUpsellComponent ? '✅' : '❌'}`);
      console.log(`Page contains showSmartUpsell state: ${hasShowUpsell ? '✅' : '❌'}`);
      
      // Check browser state
      const browserState = await page.evaluate(() => {
        const user = localStorage.getItem('user');
        return {
          userInStorage: !!user,
          userData: user ? JSON.parse(user) : null,
          totalDivs: document.querySelectorAll('div').length,
          fixedDivs: document.querySelectorAll('.fixed').length
        };
      });
      
      console.log('Browser state:', browserState);
    }
    
    await page.screenshot({ path: 'upsell-debug-final.png' });
    
    console.log('\n🎯 CONCLUSION');
    console.log('=============');
    
    if (upsellFound) {
      console.log('✅ ENTERPRISE FEATURES WORKING: I can see Smart Upsell');
      console.log('   → Tester might have cache/browser issues');
      console.log('   → Or testing different version');
    } else {
      console.log('❌ ENTERPRISE FEATURES NOT WORKING: I cannot see Smart Upsell');
      console.log('   → Deployment issue confirmed');
      console.log('   → Need to fix integration');
    }
    
  } catch (error) {
    console.error('Upsell debug test error:', error);
  } finally {
    await browser.close();
  }
}

testUpsellDebug();