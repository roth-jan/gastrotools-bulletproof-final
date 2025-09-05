const { chromium } = require('playwright');

async function testExactLatestURL() {
  console.log('🧪 PLAYWRIGHT TEST: EXACT LATEST URL');
  console.log('===================================');
  console.log('URL: https://gastrotools-bulletproof-7tqapgr1f-jhroth-7537s-projects.vercel.app');
  console.log('Testing ALL 5 user-reported issues');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    const baseUrl = 'https://gastrotools-bulletproof-7tqapgr1f-jhroth-7537s-projects.vercel.app';
    
    // Login
    await page.goto(`${baseUrl}/login`);
    await page.fill('input[type="email"]', 'demo@gastrotools.de');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    
    // TEST 1: Kostenkontrolle negative price validation
    console.log('\n1. 🚨 CRITICAL: Kostenkontrolle negative price');
    console.log('==============================================');
    
    await page.goto(`${baseUrl}/kostenkontrolle`);
    
    // User's exact scenario
    await page.fill('input[placeholder*="Tomatoes"]', 'Playwright Final Test');
    
    // Select category (critical step)
    await page.click('button:has-text("Select category")');
    await page.waitForTimeout(500);
    await page.click('text="Vegetables"');
    console.log('✅ Category selected: Vegetables');
    
    await page.fill('input[placeholder="1"]', '5'); // Positive amount
    await page.fill('input[placeholder="0.00"]', '-10'); // NEGATIVE price
    await page.fill('input[placeholder*="Supplier"]', 'Playwright Test Supplier');
    
    console.log('✅ Form filled: Amount=5, Price=-10€ (NEGATIVE)');
    
    await page.click('button:has-text("Add Entry")');
    await page.waitForTimeout(3000);
    
    const errorMessages = await page.locator('.text-red-500').allTextContents();
    const redBorders = await page.locator('.border-red-500').count();
    const entryWronglySaved = await page.locator('text="Playwright Final Test"').count();
    
    console.log(`ERROR MESSAGES: ${errorMessages.length} - "${errorMessages.join(', ')}"`);
    console.log(`RED BORDER INDICATORS: ${redBorders}`);
    console.log(`ENTRY WRONGLY SAVED: ${entryWronglySaved > 0 ? '🚨 BUG CONFIRMED' : '✅ CORRECTLY REJECTED'}`);
    
    const issue1Fixed = errorMessages.length > 0 && entryWronglySaved === 0;
    console.log(`🎯 ISSUE 1 STATUS: ${issue1Fixed ? '✅ FIXED' : '❌ STILL BROKEN'}`);
    
    await page.screenshot({ path: 'test1-kostenkontrolle.png' });
    
    // TEST 2: Lagerverwaltung negative stock
    console.log('\n2. 📦 CRITICAL: Lagerverwaltung negative stock');
    console.log('============================================');
    
    await page.goto(`${baseUrl}/lagerverwaltung`);
    
    await page.fill('input[placeholder*="Fresh"]', 'Negative Stock Test');
    await page.fill('input[placeholder="0"]', '-5'); // NEGATIVE quantity
    
    await page.click('button:has-text("Add to Inventory")');
    await page.waitForTimeout(2000);
    
    const negativeStockEntry = await page.locator('text="Negative Stock Test"').count();
    console.log(`NEGATIVE STOCK ENTRY SAVED: ${negativeStockEntry > 0 ? '🚨 BUG CONFIRMED' : '✅ CORRECTLY PREVENTED'}`);
    
    const issue2Fixed = negativeStockEntry === 0;
    console.log(`🎯 ISSUE 2 STATUS: ${issue2Fixed ? '✅ FIXED' : '❌ STILL BROKEN'}`);
    
    await page.screenshot({ path: 'test2-lagerverwaltung.png' });
    
    // TEST 3: Menüplaner 0 portions
    console.log('\n3. 📅 CRITICAL: Menüplaner 0 servings');
    console.log('====================================');
    
    await page.goto(`${baseUrl}/menueplaner`);
    
    await page.fill('input[placeholder*="Beef"]', 'Zero Portions Test');
    await page.fill('input[placeholder="4"]', '0'); // ZERO servings
    
    await page.click('button:has-text("Add to Menu")');
    await page.waitForTimeout(2000);
    
    const zeroPortionsEntry = await page.locator('text="Zero Portions Test"').count();
    console.log(`ZERO PORTIONS ENTRY SAVED: ${zeroPortionsEntry > 0 ? '🚨 BUG CONFIRMED' : '✅ CORRECTLY PREVENTED'}`);
    
    const issue3Fixed = zeroPortionsEntry === 0;
    console.log(`🎯 ISSUE 3 STATUS: ${issue3Fixed ? '✅ FIXED' : '❌ STILL BROKEN'}`);
    
    await page.screenshot({ path: 'test3-menueplaner.png' });
    
    // TEST 4: PDF Export functionality  
    console.log('\n4. 📄 CRITICAL: PDF Export');
    console.log('=========================');
    
    await page.goto(`${baseUrl}/speisekarten-designer`);
    
    // Create menu card first
    await page.fill('input[placeholder*="Summer"]', 'PDF Export Test Card');
    await page.click('button:has-text("Create New Card")');
    await page.waitForTimeout(2000);
    
    // Add some content to enable export
    const hasCategories = await page.locator('text="Categories"').count();
    if (hasCategories > 0) {
      // Try to add a category if interface exists
      console.log('Adding category for PDF test...');
    }
    
    // Test PDF Export
    const pdfButton = page.locator('button:has-text("Export PDF")');
    const pdfButtonExists = await pdfButton.count() > 0;
    
    console.log(`PDF EXPORT BUTTON EXISTS: ${pdfButtonExists ? '✅ YES' : '❌ NO'}`);
    
    if (pdfButtonExists) {
      // Monitor downloads
      let downloadStarted = false;
      
      page.on('download', () => {
        downloadStarted = true;
        console.log('✅ PDF DOWNLOAD STARTED');
      });
      
      await pdfButton.click();
      await page.waitForTimeout(5000);
      
      console.log(`PDF DOWNLOAD TRIGGERED: ${downloadStarted ? '✅ YES' : '❌ NO'}`);
    }
    
    const issue4Fixed = pdfButtonExists && downloadStarted;
    console.log(`🎯 ISSUE 4 STATUS: ${issue4Fixed ? '✅ FIXED' : '❌ STILL BROKEN'}`);
    
    await page.screenshot({ path: 'test4-pdf-export.png' });
    
    // TEST 5: Preview functionality
    console.log('\n5. 👁️ CRITICAL: Preview functionality');
    console.log('====================================');
    
    const previewButton = page.locator('button:has-text("Preview")');
    const previewButtonExists = await previewButton.count() > 0;
    
    console.log(`PREVIEW BUTTON EXISTS: ${previewButtonExists ? '✅ YES' : '❌ NO'}`);
    
    let previewWorking = false;
    if (previewButtonExists) {
      // Monitor new windows/tabs
      page.on('popup', () => {
        previewWorking = true;
        console.log('✅ PREVIEW WINDOW OPENED');
      });
      
      await previewButton.click();
      await page.waitForTimeout(3000);
      
      console.log(`PREVIEW WINDOW OPENED: ${previewWorking ? '✅ YES' : '❌ NO'}`);
    }
    
    const issue5Fixed = previewButtonExists && previewWorking;
    console.log(`🎯 ISSUE 5 STATUS: ${issue5Fixed ? '✅ FIXED' : '❌ STILL BROKEN'}`);
    
    await page.screenshot({ path: 'test5-preview.png' });
    
    // FINAL SUMMARY
    console.log('\n🏆 FINAL ISSUE STATUS SUMMARY');
    console.log('============================');
    
    const issues = [
      { name: 'Kostenkontrolle negative validation', fixed: issue1Fixed },
      { name: 'Lagerverwaltung negative prevention', fixed: issue2Fixed },
      { name: 'Menüplaner 0-portions prevention', fixed: issue3Fixed },
      { name: 'PDF Export functionality', fixed: issue4Fixed },
      { name: 'Preview window functionality', fixed: issue5Fixed }
    ];
    
    let fixedCount = 0;
    
    issues.forEach(issue => {
      const status = issue.fixed ? '✅ FIXED' : '❌ BROKEN';
      console.log(`${status} ${issue.name}`);
      if (issue.fixed) fixedCount++;
    });
    
    const successRate = Math.round((fixedCount / issues.length) * 100);
    console.log(`\n📊 FIXES SUCCESS RATE: ${fixedCount}/${issues.length} (${successRate}%)`);
    
    if (successRate === 100) {
      console.log('🎉 PERFECT: All issues fixed and working!');
    } else if (successRate >= 80) {
      console.log('🎯 GOOD: Most issues fixed, minor problems remain');
    } else {
      console.log('🚨 PROBLEMS: Major issues still present');
    }
    
    console.log('\n🎯 USER SHOULD TEST THIS EXACT URL:');
    console.log('https://gastrotools-bulletproof-7tqapgr1f-jhroth-7537s-projects.vercel.app');
    
  } catch (error) {
    console.error('Latest URL test error:', error);
  } finally {
    await browser.close();
  }
}

testExactLatestURL();