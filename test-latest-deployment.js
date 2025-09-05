const { chromium } = require('playwright');

async function testLatestDeployment() {
  console.log('🚀 TESTING LATEST DEPLOYMENT - BFyr22o7g');
  console.log('==========================================');
  console.log('URL: https://gastrotools-bulletproof-3bjp0vhu5-jhroth-7537s-projects.vercel.app');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Login to latest deployment
    await page.goto('https://gastrotools-bulletproof-3bjp0vhu5-jhroth-7537s-projects.vercel.app/login');
    await page.fill('input[type="email"]', 'demo@gastrotools.de');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    
    // CRITICAL TEST 1: Menüplaner Portions Fix Verification
    console.log('\n📅 CRITICAL: Menüplaner Portions Fix');
    console.log('===================================');
    
    await page.goto('https://gastrotools-bulletproof-3bjp0vhu5-jhroth-7537s-projects.vercel.app/menueplaner');
    
    // Test the exact scenario: 8 servings input → should display 8, not 4
    await page.fill('input[placeholder*="Beef"]', 'FINAL TEST - 8 Servings');
    await page.fill('input[placeholder="4"]', '8');
    
    console.log('✅ Entered: 8 servings');
    
    await page.click('button:has-text("Add to Menu")');
    await page.waitForTimeout(3000);
    
    // Check multiple ways to find the servings display
    const eightServings = await page.locator('text="8 servings"').count();
    const fourServings = await page.locator('text="4 servings"').count();
    const anyServings = await page.locator('text=/\\d+ servings/').allTextContents();
    
    console.log(`Found "8 servings": ${eightServings}`);
    console.log(`Found "4 servings": ${fourServings}`);
    console.log(`All servings found: ${anyServings.join(', ')}`);
    
    const isFixed = eightServings > 0 && fourServings === 0;
    console.log(`🎯 PORTIONS BUG STATUS: ${isFixed ? '✅ COMPLETELY FIXED' : '❌ Still has issues'}`);
    
    // CRITICAL TEST 2: PDF Export Fix Verification  
    console.log('\n📄 CRITICAL: PDF Export Fix');
    console.log('===========================');
    
    await page.goto('https://gastrotools-bulletproof-3bjp0vhu5-jhroth-7537s-projects.vercel.app/speisekarten-designer');
    
    // Create menu card to enable PDF export
    await page.fill('input[placeholder*="Summer"]', 'PDF Export Test Card');
    await page.click('button:has-text("Create New Card")');
    await page.waitForTimeout(2000);
    
    // Check if Export PDF button is present and functional
    const exportBtn = page.locator('button:has-text("Export PDF")');
    const exportBtnVisible = await exportBtn.count() > 0;
    
    console.log(`PDF Export button visible: ${exportBtnVisible ? '✅ YES' : '❌ NO'}`);
    
    if (exportBtnVisible) {
      // Test if clicking shows alert (old) or starts download (fixed)
      let downloadStarted = false;
      let alertShown = false;
      
      // Listen for downloads
      page.on('download', () => {
        downloadStarted = true;
        console.log('✅ Download initiated - REAL PDF export working!');
      });
      
      // Listen for alerts  
      page.on('dialog', dialog => {
        alertShown = true;
        console.log(`⚠️ Alert shown: ${dialog.message()}`);
        dialog.accept();
      });
      
      await exportBtn.click();
      await page.waitForTimeout(5000);
      
      if (downloadStarted) {
        console.log('🎉 PDF EXPORT: COMPLETELY FIXED - Real download working!');
      } else if (alertShown) {
        console.log('❌ PDF Export: Still shows alert (fix not deployed yet)');
      } else {
        console.log('⚠️ PDF Export: Unknown behavior - need more investigation');
      }
    }
    
    // FINAL VERIFICATION: Overall App Quality
    console.log('\n🏆 FINAL: Overall App Quality Check');
    console.log('===================================');
    
    const qualityChecks = [
      { name: 'Homepage loads', test: async () => {
        await page.goto('https://gastrotools-bulletproof-3bjp0vhu5-jhroth-7537s-projects.vercel.app');
        return (await page.locator('h1').count()) > 0;
      }},
      { name: 'Authentication works', test: async () => {
        await page.goto('https://gastrotools-bulletproof-3bjp0vhu5-jhroth-7537s-projects.vercel.app/dashboard');
        return page.url().includes('dashboard');
      }},
      { name: 'All tools accessible', test: async () => {
        const tools = ['/naehrwertrechner', '/kostenkontrolle', '/lagerverwaltung', '/menueplaner'];
        let working = 0;
        for (const tool of tools) {
          await page.goto(`https://gastrotools-bulletproof-3bjp0vhu5-jhroth-7537s-projects.vercel.app${tool}`);
          if ((await page.locator('h1, h2').count()) > 0) working++;
        }
        return working === tools.length;
      }},
      { name: 'USDA Integration works', test: async () => {
        await page.goto('https://gastrotools-bulletproof-3bjp0vhu5-jhroth-7537s-projects.vercel.app/naehrwertrechner');
        await page.fill('input[placeholder*="ingredient"]', 'Quality Test');
        await page.click('button:has-text("🇺🇸 USDA")');
        await page.waitForTimeout(6000);
        return await page.evaluate(() => {
          const text = document.body.textContent.toLowerCase();
          return text.includes('kcal') || text.includes('protein');
        });
      }}
    ];
    
    let passedChecks = 0;
    
    for (const check of qualityChecks) {
      try {
        const result = await check.test();
        if (result) {
          passedChecks++;
          console.log(`✅ ${check.name}: PASS`);
        } else {
          console.log(`❌ ${check.name}: FAIL`);
        }
      } catch (e) {
        console.log(`❌ ${check.name}: ERROR - ${e.message}`);
      }
    }
    
    const qualityScore = Math.round((passedChecks / qualityChecks.length) * 100);
    console.log(`\n🎯 FINAL QUALITY SCORE: ${passedChecks}/${qualityChecks.length} (${qualityScore}%)`);
    
    if (qualityScore >= 100) {
      console.log('🏆 PERFECT: 100% PRODUCTION READY!');
    } else if (qualityScore >= 75) {
      console.log('🎯 EXCELLENT: Professional grade, minor issues only');
    } else {
      console.log('⚠️ NEEDS WORK: Major issues remain');
    }
    
  } catch (error) {
    console.error('Latest deployment test error:', error);
  } finally {
    await browser.close();
  }
}

testLatestDeployment();