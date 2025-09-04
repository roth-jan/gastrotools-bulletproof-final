const { chromium } = require('playwright');

(async () => {
  console.log('🧪 UI REGISTRATION TEST');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();

  try {
    console.log('📝 Testing UI Registration...');
    await page.goto('https://gastrotools-bulletproof.vercel.app/register');
    await page.waitForLoadState('networkidle');
    
    const timestamp = Date.now();
    const testEmail = `ui.fix.${timestamp}@example.com`;
    
    await page.fill('input[name="name"]', 'UI Fix Test');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="company"]', 'Test Restaurant');
    await page.fill('input[name="password"]', 'uifix123');
    
    console.log(`📧 Test email: ${testEmail}`);
    
    // Submit registration
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    
    const content = await page.textContent('body');
    
    if (content.includes('successful') || content.includes('erfolgreich')) {
      console.log('✅ UI Registration SUCCESS MESSAGE SHOWN');
      
      // Test login with registered user
      console.log('\n🔐 Testing Login with registered user...');
      await page.goto('https://gastrotools-bulletproof.vercel.app/login');
      await page.waitForTimeout(2000);
      
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', 'uifix123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/dashboard')) {
        console.log('✅ Login with registered user SUCCESSFUL');
      } else {
        console.log('❌ Login with registered user FAILED');
      }
      
    } else {
      console.log('❌ UI Registration did NOT show success message');
      console.log('Current page content check for errors...');
      
      if (content.includes('error') || content.includes('failed')) {
        console.log('❌ Registration form shows error message');
      } else {
        console.log('⚠️  Registration form shows no feedback');
      }
    }

    // Test Menu Card Export
    console.log('\n📄 Testing Menu Card Export...');
    await page.goto('https://gastrotools-bulletproof.vercel.app/speisekarten-designer');
    await page.waitForTimeout(2000);
    
    // Create menu card
    await page.fill('input[placeholder*="Summer Menu"], input[value=""]', 'Export Test Menu');
    await page.click('button:has-text("Create New Card"), button:has-text("Create")');
    await page.waitForTimeout(2000);
    
    // Look for export buttons
    const exportButtons = await page.locator('button').allTextContents();
    const hasPreview = exportButtons.some(text => text.includes('Preview'));
    const hasExport = exportButtons.some(text => text.includes('Export') || text.includes('PDF'));
    
    console.log(`📋 Available buttons: ${exportButtons.join(', ')}`);
    console.log(`📄 Preview available: ${hasPreview}`);
    console.log(`📄 Export available: ${hasExport}`);

    console.log('\n🎯 UI VERIFICATION RESULTS:');
    console.log('1. Registration Success Message:', content.includes('successful') ? '✅' : '❌');
    console.log('2. Menu Export Buttons:', (hasPreview || hasExport) ? '✅' : '❌');
    
    // Keep open for manual verification
    console.log('\n🔍 Browser open for manual check...');
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Test error:', error.message);
    await browser.close();
  }
})();