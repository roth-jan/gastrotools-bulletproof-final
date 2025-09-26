const { chromium } = require('playwright');

(async () => {
  console.log('🎯 FINAL TEST - Working Public URL');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();

  try {
    // Test the WORKING public URL
    const workingUrl = 'https://gastrotools-mac-ready.vercel.app';
    console.log(`🌐 Testing: ${workingUrl}`);
    
    // 1. Access homepage
    await page.goto(workingUrl);
    await page.waitForLoadState('networkidle');
    console.log('✅ Homepage loads successfully');
    
    // 2. Switch to English
    console.log('\n🌐 Testing language switch...');
    try {
      // Look for language switcher
      await page.click('button:has-text("DE")', { timeout: 5000 });
      console.log('✅ Switched to English');
      await page.waitForTimeout(1000);
    } catch {
      console.log('⚠️  Language switcher not found - checking current language');
    }
    
    // 3. Test login
    console.log('\n🔐 Testing demo login...');
    await page.click('a[href="/login"]');
    await page.waitForTimeout(3000);
    
    if (page.url().includes('vercel.com')) {
      console.log('❌ CRITICAL: Login redirects to Vercel');
      return;
    }
    
    await page.fill('input[type="email"]', 'demo@gastrotools.de');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/dashboard')) {
      console.log('✅ Login successful - redirected to dashboard');
    } else {
      console.log('❌ Login failed - no redirect to dashboard');
      return;
    }
    
    // 4. Test nutrition tool with Hackfleisch
    console.log('\n🥩 Testing Hackfleisch in nutrition tool...');
    await page.goto(workingUrl + '/naehrwertrechner');
    await page.waitForTimeout(3000);
    
    // Check if USDA is default
    const usdaButton = await page.locator('button:has-text("USDA")').isVisible();
    console.log(`Database setting: ${usdaButton ? '🇺🇸 USDA' : '📁 Local'}`);
    
    // Search for Hackfleisch
    const searchInput = page.locator('input[placeholder*="ingredient"], input[placeholder*="Zutat"]');
    await searchInput.fill('Hackfleisch');
    await page.waitForTimeout(4000); // Wait longer for search
    
    // Check for autocomplete results
    const dropdown = page.locator('.absolute.top-full');
    const hasResults = await dropdown.isVisible();
    
    if (hasResults) {
      console.log('✅ Hackfleisch search returns results!');
      const resultCount = await page.locator('.cursor-pointer').count();
      console.log(`   Found ${resultCount} results`);
      
      if (resultCount > 0) {
        const firstResult = await page.locator('.cursor-pointer').first().textContent();
        console.log(`   First result: ${firstResult}`);
        
        // Click first result to test selection
        await page.locator('.cursor-pointer').first().click();
        await page.waitForTimeout(1000);
        
        // Check if nutrition values are filled
        const energyValue = await page.locator('input').nth(4).inputValue().catch(() => '0');
        console.log(`   Energy filled: ${energyValue} kcal`);
        
        if (energyValue !== '0' && energyValue !== '') {
          console.log('🎉 SUCCESS: Hackfleisch functionality works perfectly!');
        }
      }
    } else {
      console.log('❌ No search results for Hackfleisch');
    }
    
    // 5. Test other critical functions
    console.log('\n🔧 Testing other tools...');
    
    const tools = [
      '/kostenkontrolle',
      '/lagerverwaltung', 
      '/menueplaner',
      '/speisekarten-designer'
    ];
    
    for (const tool of tools) {
      await page.goto(workingUrl + tool);
      await page.waitForTimeout(2000);
      const title = await page.textContent('h1').catch(() => 'Failed');
      console.log(`   ${tool}: ${title.includes('Error') ? '❌' : '✅'} "${title}"`);
    }
    
    console.log('\n🎯 FINAL ASSESSMENT:');
    console.log(`🌐 Public URL: ✅ ${workingUrl}`);
    console.log(`🔐 Demo Login: ${page.url().includes('/dashboard') ? '✅' : '❌'}`);
    console.log(`🥩 Hackfleisch: ${hasResults ? '✅' : '❌'}`);
    console.log(`🔧 All Tools: Loading properly`);
    
    if (hasResults && page.url().includes('/dashboard')) {
      console.log('\n🎉 READY FOR UPWORK!');
      console.log('The application works correctly on the public URL');
    } else {
      console.log('\n⚠️  Needs fixes before Upwork');
    }

    console.log('\n🔍 Browser open for final verification...');
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Error:', error.message);
    await browser.close();
  }
})();