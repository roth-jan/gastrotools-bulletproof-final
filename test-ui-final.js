const { chromium } = require('playwright');

(async () => {
  console.log('🧪 FINAL UI TEST - Is registration UI working now?');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();

  try {
    await page.goto('https://gastrotools-bulletproof.vercel.app/register');
    await page.waitForLoadState('networkidle');
    
    const timestamp = Date.now();
    const testEmail = `ui.final.check.${timestamp}@example.com`;
    
    console.log(`📧 Testing with: ${testEmail}`);
    
    await page.fill('input[name="name"]', 'UI Final Check');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'uifinalcheck123');
    
    // Monitor network requests
    page.on('response', response => {
      if (response.url().includes('/api/auth')) {
        console.log(`📡 API Response: ${response.status()} ${response.url()}`);
      }
    });

    await page.click('button[type="submit"]');
    await page.waitForTimeout(8000); // Wait longer for response
    
    const content = await page.textContent('body');
    
    if (content.includes('successful') || content.includes('erfolgreich')) {
      console.log('🎉 UI REGISTRATION SUCCESS MESSAGE SHOWN!');
      console.log('✅ Issue 1 FIXED');
    } else {
      console.log('❌ UI Registration still not showing success');
      console.log('❓ NEED USER HELP to debug frontend issue');
      
      // Check for any error messages
      const errorDiv = page.locator('.bg-red-50, [class*="error"]');
      if (await errorDiv.isVisible()) {
        const errorText = await errorDiv.textContent();
        console.log(`❌ Error shown: ${errorText}`);
      } else {
        console.log('⚠️  No error or success message - silent failure');
      }
    }

    console.log('\n🔍 Browser open for your inspection...');
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Test error:', error.message);
    await browser.close();
  }
})();