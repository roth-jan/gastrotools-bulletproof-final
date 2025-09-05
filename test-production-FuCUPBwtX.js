const { chromium } = require('playwright');

async function testProductionFuCUPBwtX() {
  console.log('🚀 TESTING PRODUCTION FuCUPBwtX - ALL 5 FIXES');
  console.log('==============================================');
  console.log('URL: https://gastrotools-bulletproof-795lqacmm-jhroth-7537s-projects.vercel.app');
  console.log('Expected: ALL user-reported issues should be resolved');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Monitor all browser activity
  page.on('console', msg => {
    if (msg.text().includes('✅') || msg.text().includes('PDF') || msg.text().includes('Preview')) {
      console.log(`[BROWSER] ${msg.text()}`);
    }
  });
  
  try {
    const baseUrl = 'https://gastrotools-bulletproof-795lqacmm-jhroth-7537s-projects.vercel.app';
    
    // Login
    console.log('\n🔐 Login to FuCUPBwtX production...');
    await page.goto(`${baseUrl}/login`);
    await page.fill('input[type="email"]', 'demo@gastrotools.de');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    console.log('✅ Login successful');
    
    let fixedIssues = 0;
    const totalIssues = 5;
    
    // ISSUE 1: Kostenkontrolle negative price validation
    console.log('\n1. 💰 ISSUE 1: Kostenkontrolle negative validation');
    console.log('================================================');
    
    await page.goto(`${baseUrl}/kostenkontrolle`);
    
    await page.fill('input[placeholder*="Tomatoes"]', 'Final Issue 1 Test');
    await page.click('button:has-text("Select category")');
    await page.waitForTimeout(500);
    await page.click('text="Vegetables"');
    await page.fill('input[placeholder="1"]', '5');
    await page.fill('input[placeholder="0.00"]', '-10'); // NEGATIVE
    await page.fill('input[placeholder*="Supplier"]', 'Final Test Supplier');
    
    await page.click('button:has-text("Add Entry")');
    await page.waitForTimeout(2000);
    
    const issue1Errors = await page.locator('.text-red-500').count();
    const issue1Entry = await page.locator('text="Final Issue 1 Test"').count();
    
    if (issue1Errors > 0 && issue1Entry === 0) {
      fixedIssues++;
      console.log('✅ ISSUE 1: FIXED - Error shown, entry prevented');
    } else {
      console.log('❌ ISSUE 1: BROKEN - No error or entry saved incorrectly');
    }
    
    await page.screenshot({ path: 'final-issue1-test.png' });
    
    // ISSUE 2: Lagerverwaltung negative stock
    console.log('\n2. 📦 ISSUE 2: Lagerverwaltung negative stock');
    console.log('===========================================');
    
    await page.goto(`${baseUrl}/lagerverwaltung`);
    
    await page.fill('input[placeholder*="Fresh"]', 'Final Issue 2 Test');
    await page.fill('input[placeholder="0"]', '-5'); // NEGATIVE
    
    await page.click('button:has-text("Add to Inventory")');
    await page.waitForTimeout(2000);
    
    const issue2Entry = await page.locator('text="Final Issue 2 Test"').count();
    
    if (issue2Entry === 0) {
      fixedIssues++;
      console.log('✅ ISSUE 2: FIXED - Negative stock prevented');
    } else {
      console.log('❌ ISSUE 2: BROKEN - Negative stock allowed');
    }
    
    await page.screenshot({ path: 'final-issue2-test.png' });
    
    // ISSUE 3: Menüplaner 0 servings
    console.log('\n3. 📅 ISSUE 3: Menüplaner 0 servings');
    console.log('===================================');
    
    await page.goto(`${baseUrl}/menueplaner`);
    
    await page.fill('input[placeholder*="Beef"]', 'Final Issue 3 Test');
    await page.fill('input[placeholder="4"]', '0'); // ZERO servings
    
    await page.click('button:has-text("Add to Menu")');
    await page.waitForTimeout(2000);
    
    const issue3Entry = await page.locator('text="Final Issue 3 Test"').count();
    
    if (issue3Entry === 0) {
      fixedIssues++;
      console.log('✅ ISSUE 3: FIXED - Zero servings prevented');
    } else {
      console.log('❌ ISSUE 3: BROKEN - Zero servings allowed');
    }
    
    await page.screenshot({ path: 'final-issue3-test.png' });
    
    // ISSUE 4: PDF Export (CRITICAL TEST - should now be visible)
    console.log('\n4. 📄 ISSUE 4: PDF Export functionality');
    console.log('=====================================');
    
    await page.goto(`${baseUrl}/speisekarten-designer`);
    
    // Create menu card (should immediately show buttons with my fix)
    await page.fill('input[placeholder*="Summer"]', 'Final Issue 4 PDF Test');
    await page.click('button:has-text("Create New Card")');
    await page.waitForTimeout(3000);
    
    // Check if Export PDF button is NOW visible
    const pdfButton = page.locator('button:has-text("Export PDF")');
    const pdfButtonExists = await pdfButton.count() > 0;
    
    console.log(`PDF Export button visible: ${pdfButtonExists ? '✅ YES' : '❌ STILL MISSING'}`);
    
    if (pdfButtonExists) {
      let downloadStarted = false;
      
      // Monitor downloads
      page.on('download', (download) => {
        downloadStarted = true;
        console.log(`[DOWNLOAD] ✅ PDF Download: ${download.suggestedFilename()}`);
      });
      
      await pdfButton.click();
      await page.waitForTimeout(5000);
      
      if (downloadStarted) {
        fixedIssues++;
        console.log('✅ ISSUE 4: FIXED - PDF download working');
      } else {
        console.log('❌ ISSUE 4: PARTIAL - Button visible but download failed');
      }
    } else {
      console.log('❌ ISSUE 4: BROKEN - Button still not visible');
    }
    
    await page.screenshot({ path: 'final-issue4-test.png' });
    
    // ISSUE 5: Preview functionality
    console.log('\n5. 👁️ ISSUE 5: Preview window');
    console.log('=============================');
    
    const previewButton = page.locator('button:has-text("Preview")');
    const previewButtonExists = await previewButton.count() > 0;
    
    console.log(`Preview button visible: ${previewButtonExists ? '✅ YES' : '❌ STILL MISSING'}`);
    
    if (previewButtonExists) {
      let windowOpened = false;
      
      // Monitor popup windows
      page.on('popup', () => {
        windowOpened = true;
        console.log('[POPUP] ✅ Preview window opened');
      });
      
      await previewButton.click();
      await page.waitForTimeout(3000);
      
      if (windowOpened) {
        fixedIssues++;
        console.log('✅ ISSUE 5: FIXED - Preview window opens');
      } else {
        console.log('❌ ISSUE 5: PARTIAL - Button visible but window failed');
      }
    } else {
      console.log('❌ ISSUE 5: BROKEN - Button still not visible');
    }
    
    await page.screenshot({ path: 'final-issue5-test.png' });
    
    // FINAL ASSESSMENT
    console.log('\n🏆 FINAL COMPREHENSIVE ASSESSMENT');
    console.log('=================================');
    
    const successRate = Math.round((fixedIssues / totalIssues) * 100);
    console.log(`FIXES WORKING: ${fixedIssues}/${totalIssues} (${successRate}%)`);
    
    if (successRate === 100) {
      console.log('🎉 PERFECT: ALL 5 ISSUES COMPLETELY RESOLVED!');
      console.log('🚀 APP IS NOW 100% PRODUCTION READY!');
      console.log('🏆 READY FOR UPWORK DOMINATION!');
    } else if (successRate >= 80) {
      console.log('🎯 EXCELLENT: Most issues fixed, app is production-ready');
      console.log(`📋 ${totalIssues - fixedIssues} remaining issues to address`);
    } else if (successRate >= 60) {
      console.log('🔧 PROGRESS: Major improvements, getting close');
      console.log(`📋 ${totalIssues - fixedIssues} issues still need work`);
    } else {
      console.log('🚨 PROBLEMS: Major issues persist, more work needed');
    }
    
    console.log('\n📊 DETAILED BREAKDOWN:');
    console.log('======================');
    console.log('1. Kostenkontrolle negative validation: Testing completed');
    console.log('2. Lagerverwaltung negative prevention: Testing completed');  
    console.log('3. Menüplaner 0-servings prevention: Testing completed');
    console.log('4. PDF Export functionality: Testing completed');
    console.log('5. Preview window functionality: Testing completed');
    
    console.log('\n🎯 PRODUCTION URL FOR USER TESTING:');
    console.log('===================================');
    console.log('https://gastrotools-bulletproof-795lqacmm-jhroth-7537s-projects.vercel.app');
    console.log('User should test the exact same scenarios that failed before!');
    
  } catch (error) {
    console.error('Production FuCUPBwtX test error:', error);
  } finally {
    await browser.close();
  }
}

testProductionFuCUPBwtX();