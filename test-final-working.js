const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    devtools: true
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🔍 FINALER TEST: Speisekarten Designer mit verbessertem Login\n');

  try {
    // 1. Direct API Login (umgeht UI-Probleme)
    console.log('1. Performing API Login...');

    const loginResponse = await page.request.post('http://localhost:3000/api/auth/login', {
      data: {
        email: 'demo@gastrotools.de',
        password: 'demo123'
      }
    });

    if (loginResponse.ok()) {
      const loginData = await loginResponse.json();
      console.log('   ✅ Login successful via API');
      console.log(`   Token: ${loginData.token.substring(0, 20)}...`);

      // Set auth cookie manually
      await context.addCookies([{
        name: 'auth-token',
        value: loginData.token,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax'
      }]);

      // Also set localStorage for client-side auth
      await page.addInitScript((token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({
          id: 'demo-user-123',
          email: 'demo@gastrotools.de',
          name: 'Demo User',
          plan: 'free'
        }));
      }, loginData.token);

    } else {
      console.error('   ❌ Login failed');
      return;
    }

    // 2. Navigate to Speisekarten Designer
    console.log('\n2. Navigating to Speisekarten Designer...');
    await page.goto('http://localhost:3000/speisekarten-designer');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);

    if (currentUrl.includes('login')) {
      console.log('   ❌ Still redirected to login - auth not working');

      // Try alternative: navigate from homepage
      console.log('\n3. Alternative: Navigate from homepage...');
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Click on Menu Card Designer
      const menuCardButton = page.locator('text=Menu Card Designer').first();
      if (await menuCardButton.isVisible()) {
        await menuCardButton.click();
        console.log('   ✓ Clicked on Menu Card Designer');
        await page.waitForTimeout(2000);
      }
    } else {
      console.log('   ✅ Successfully on designer page!');
    }

    // 3. Analyze page content
    console.log('\n4. Analyzing page content...');

    // Check for any headings
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log(`   Headings found: ${headings.length}`);
    headings.slice(0, 5).forEach(h => console.log(`     - ${h}`));

    // Check for menu sections
    console.log('\n5. Looking for menu sections...');
    const menuSections = ['Vorspeisen', 'Hauptgerichte', 'Desserts', 'Getränke',
                          'Appetizers', 'Main Courses', 'Desserts', 'Beverages'];

    for (const section of menuSections) {
      const found = await page.locator(`text=${section}`).count() > 0;
      if (found) {
        console.log(`   ✅ Found: ${section}`);
      }
    }

    // Check for any forms or input fields
    console.log('\n6. Checking for interactive elements...');
    const forms = await page.locator('form').count();
    const inputs = await page.locator('input, textarea, select').count();
    const buttons = await page.locator('button').count();

    console.log(`   Forms: ${forms}`);
    console.log(`   Input fields: ${inputs}`);
    console.log(`   Buttons: ${buttons}`);

    // Look for any add/create buttons
    const addPatterns = ['add', 'hinzu', 'neu', 'create', 'plus', '+'];
    for (const pattern of addPatterns) {
      const addButtons = await page.locator(`button:has-text("${pattern}")`).count();
      if (addButtons > 0) {
        console.log(`   ✅ Found ${addButtons} buttons with "${pattern}"`);
      }
    }

    // 7. Check page source for clues
    console.log('\n7. Checking page structure...');
    const bodyText = await page.locator('body').textContent();

    if (bodyText.includes('Speisekarte') || bodyText.includes('Menu')) {
      console.log('   ✅ Menu-related content found in page');
    }

    if (bodyText.includes('PDF') || bodyText.includes('Export')) {
      console.log('   ✅ Export functionality mentioned');
    }

    // 8. Final screenshot
    console.log('\n8. Taking final screenshot...');
    await page.screenshot({
      path: 'speisekarten-designer-final-result.png',
      fullPage: true
    });
    console.log('   ✓ Screenshot saved');

    // FINAL VERDICT
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINALER STATUS:');
    console.log('='.repeat(60));

    if (!currentUrl.includes('login') && (inputs > 0 || buttons > 5)) {
      console.log('✅ SPEISEKARTEN DESIGNER IST ERREICHBAR!');
      console.log('   - Authentication: Working');
      console.log('   - Page loaded: Yes');
      console.log(`   - Interactive elements: ${inputs + buttons} found`);
      console.log('\n⚠️  HINWEIS: Die Seite lädt, aber die genaue Funktionalität');
      console.log('   muss manuell getestet werden, da die UI-Struktur variiert.');
    } else {
      console.log('❌ SPEISEKARTEN DESIGNER HAT PROBLEME');
      console.log('   - Authentication oder Routing funktioniert nicht korrekt');
      console.log('   - Die Seite erfordert weitere Debugging-Schritte');
    }

  } catch (error) {
    console.error('\n❌ TEST FEHLGESCHLAGEN:', error.message);
    console.error(error.stack);
  }

  console.log('\nTest beendet. Browser bleibt 10 Sekunden offen...');
  await page.waitForTimeout(10000);
  await browser.close();
})();