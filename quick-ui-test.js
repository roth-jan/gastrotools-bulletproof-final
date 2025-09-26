const { chromium } = require('playwright');

(async () => {
  console.log('🧪 QUICK UI REGISTRATION TEST');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();

  try {
    console.log('📝 Testing UI Registration after redeploy...');
    await page.goto('https://gastrotools-bulletproof.vercel.app/register');
    await page.waitForLoadState('networkidle');
    
    const timestamp = Date.now();
    const testEmail = `ui.final.${timestamp}@example.com`;
    
    await page.fill('input[name="name"]', 'UI Final Test');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="company"]', 'Final Test Restaurant');
    await page.fill('input[name="password"]', 'uifinal123');
    
    console.log(`📧 Test email: ${testEmail}`);
    
    // Submit registration
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    
    const content = await page.textContent('body');
    
    if (content.includes('successful') || content.includes('erfolgreich')) {
      console.log('✅ UI Registration SUCCESS MESSAGE SHOWN');
      
      // Test login immediately
      console.log('\n🔐 Testing login with registered user...');
      
      if (page.url().includes('/login')) {
        // Already redirected to login
        await page.fill('input[type="email"]', testEmail);
        await page.fill('input[type="password"]', 'uifinal123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
        
        if (page.url().includes('/dashboard')) {
          console.log('✅ LOGIN SUCCESSFUL - redirected to dashboard');
        } else {
          console.log('❌ Login failed - no dashboard redirect');
        }
      }
      
    } else {
      console.log('❌ UI Registration FAILED');
      console.log('Checking for error messages...');
      
      const errorElements = await page.locator('.bg-red-50, .text-red-600, [class*="error"]').allTextContents();
      if (errorElements.length > 0) {
        console.log(`❌ Error shown: ${errorElements.join(', ')}`);
      } else {
        console.log('⚠️  No success or error message - check network tab');
      }
    }

    console.log('\n🎯 UI REGISTRATION TEST COMPLETE');
    console.log('Manual verification available in browser');
    
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Test error:', error.message);
    await browser.close();
  }
})();