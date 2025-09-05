const { chromium } = require('playwright');

async function testUpdatedMainDomain() {
  console.log('🚨 TESTING UPDATED MAIN DOMAIN - POST ALIAS UPDATE');
  console.log('================================================');
  console.log('URL: https://gastrotools-bulletproof.vercel.app (UPDATED)');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Force no cache
  await page.setExtraHTTPHeaders({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  try {
    // Test User's EXACT scenario IMMEDIATELY
    console.log('\n1. 🔐 Login with cache-busting...');
    await page.goto('https://gastrotools-bulletproof.vercel.app/login?_cb=' + Date.now());
    
    await page.fill('input[type="email"]', 'demo@gastrotools.de');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    
    console.log('\n2. 🚨 CRITICAL TEST: Kostenkontrolle Negative Values');
    await page.goto('https://gastrotools-bulletproof.vercel.app/kostenkontrolle?_cb=' + Date.now());
    
    // Fill EXACT user scenario
    await page.fill('input[placeholder*="Tomatoes"]', 'Critical Bug Test');
    
    // Select category
    await page.click('button:has-text("Select category")');
    await page.waitForTimeout(500);
    await page.click('text="Vegetables"');
    
    await page.fill('input[placeholder="1"]', '5'); // Positive amount
    await page.fill('input[placeholder="0.00"]', '-10'); // NEGATIVE PRICE
    await page.fill('input[placeholder*="Supplier"]', 'Bug Test Supplier');
    
    console.log('✅ Form filled with: Amount=5, Price=-10€');
    
    // Submit and check IMMEDIATE response
    console.log('\n3. 🚀 Submit and monitor...');
    
    await page.click('button:has-text("Add Entry")');
    await page.waitForTimeout(3000);
    
    // Check for errors
    const errorMessages = await page.locator('.text-red-500').allTextContents();
    const redBorders = await page.locator('.border-red-500').count();
    const entryAdded = await page.locator('text="Critical Bug Test", text="-10"').count();
    
    console.log(`Error messages: ${errorMessages.length} - ${errorMessages.join(', ')}`);
    console.log(`Red border indicators: ${redBorders}`);
    console.log(`Entry wrongly saved: ${entryAdded > 0 ? '🚨 BUG CONFIRMED' : '✅ CORRECTLY REJECTED'}`);
    
    // VERDICT
    if (errorMessages.length > 0 && entryAdded === 0) {
      console.log('\n✅ FIXED: Validation working, error shown, entry rejected');
    } else if (entryAdded > 0) {
      console.log('\n🚨 BUG CONFIRMED: Negative entry saved');
    } else if (errorMessages.length === 0) {
      console.log('\n🚨 BUG CONFIRMED: No error feedback');
    }
    
    // Quick test other issues
    console.log('\n4. 🧪 Quick test other critical issues...');
    
    // Test 2: Lagerverwaltung negative
    await page.goto('https://gastrotools-bulletproof.vercel.app/lagerverwaltung?_cb=' + Date.now());
    await page.fill('input[placeholder*="Fresh"]', 'Negative Stock Test');
    await page.fill('input[placeholder="0"]', '-5'); // Negative stock
    
    await page.click('button:has-text("Add to Inventory")');
    await page.waitForTimeout(2000);
    
    const negativeStockAdded = await page.locator('text="Negative Stock Test", text="-5"').count();
    console.log(`Negative stock accepted: ${negativeStockAdded > 0 ? '🚨 BUG' : '✅ PREVENTED'}`);
    
    // Test 3: Menüplaner 0 portions
    await page.goto('https://gastrotools-bulletproof.vercel.app/menueplaner?_cb=' + Date.now());
    await page.fill('input[placeholder*="Beef"]', 'Zero Portions Test');
    await page.fill('input[placeholder="4"]', '0'); // Zero portions
    
    await page.click('button:has-text("Add to Menu")');
    await page.waitForTimeout(2000);
    
    const zeroPortionsAdded = await page.locator('text="Zero Portions Test", text="0 servings"').count();
    console.log(`Zero portions accepted: ${zeroPortionsAdded > 0 ? '🚨 BUG' : '✅ PREVENTED'}`);
    
    await page.screenshot({ path: 'post-alias-update-test.png' });
    
  } catch (error) {
    console.error('Updated domain test error:', error);
  } finally {
    await browser.close();
  }
}

testUpdatedMainDomain();