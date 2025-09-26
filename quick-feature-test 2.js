const { chromium } = require('playwright');

(async () => {
  console.log('🧪 QUICK FEATURE VERIFICATION TEST');
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();

  try {
    // Login with demo account
    console.log('🔐 Demo login...');
    await page.goto('https://gastrotools-bulletproof.vercel.app/login');
    await page.fill('input[type="email"]', 'demo@gastrotools.de');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    if (!page.url().includes('/dashboard')) {
      throw new Error('Demo login failed');
    }
    console.log('✅ Demo login successful');

    // Test Menu Card Designer Export
    console.log('\n📄 Testing Menu Card Export...');
    await page.goto('https://gastrotools-bulletproof.vercel.app/speisekarten-designer');
    await page.waitForTimeout(2000);
    
    // Create a test menu card
    await page.fill('input[placeholder*="Summer Menu"]', 'Test Export Menu');
    await page.click('button:has-text("Create New Card")');
    await page.waitForTimeout(2000);
    
    // Try export buttons
    const previewButton = page.locator('button:has-text("Preview")');
    const exportButton = page.locator('button:has-text("Export PDF")');
    
    if (await previewButton.isVisible()) {
      await previewButton.click();
      await page.waitForTimeout(2000);
      console.log('📋 Preview button clicked');
    } else {
      console.log('❌ Preview button not found');
    }
    
    if (await exportButton.isVisible()) {
      await exportButton.click();
      await page.waitForTimeout(2000);
      console.log('📋 Export PDF button clicked');
    } else {
      console.log('❌ Export PDF button not found');
    }

    // Test Language Switching Completeness
    console.log('\n🌐 Testing Language Completeness...');
    await page.goto('https://gastrotools-bulletproof.vercel.app');
    
    // Switch to English
    const langButton = page.locator('button:has-text("EN")');
    if (await langButton.isVisible()) {
      await langButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Check for German text in English mode
    const bodyText = await page.textContent('body');
    const germanWords = ['Nährwert', 'Kostenkontrolle', 'Lagerverwaltung', 'Menüplaner', 'Speisekarten'];
    const foundGerman = germanWords.filter(word => bodyText.includes(word));
    
    if (foundGerman.length > 0) {
      console.log(`❌ German words found in EN mode: ${foundGerman.join(', ')}`);
    } else {
      console.log('✅ No German words found in English mode');
    }

    // Test Registration UI
    console.log('\n📝 Testing UI Registration...');
    await page.goto('https://gastrotools-bulletproof.vercel.app/register');
    await page.waitForTimeout(2000);
    
    const timestamp = Date.now();
    await page.fill('input[name="name"]', 'UI Test User');
    await page.fill('input[name="email"]', `ui.test.${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'uitest123');
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    
    const content = await page.textContent('body');
    if (content.includes('successful') || content.includes('erfolgreich')) {
      console.log('✅ UI Registration shows success message');
    } else {
      console.log('❌ UI Registration did not show success');
    }

    console.log('\n🎯 QUICK VERIFICATION COMPLETE');
    console.log('Check browser for visual verification');

    // Keep open for manual check
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Test error:', error.message);
    await browser.close();
  }
})();