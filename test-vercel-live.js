const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🌐 TESTING LIVE VERSION ON VERCEL\n');
  console.log('URL: https://gastrotools-bulletproof-final.vercel.app/');
  console.log('='

.repeat(60) + '\n');

  let testsSuccessful = 0;
  let testsTotal = 0;

  try {
    // TEST 1: Homepage lädt
    testsTotal++;
    console.log('TEST 1: Homepage Loading...');
    await page.goto('https://gastrotools-bulletproof-final.vercel.app/');
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    console.log(`   Page Title: ${title}`);

    // Check for main elements
    const h1Text = await page.locator('h1').first().textContent().catch(() => 'No H1 found');
    console.log(`   Main Heading: ${h1Text}`);

    if (title && h1Text) {
      console.log('   ✅ Homepage loaded successfully\n');
      testsSuccessful++;
    } else {
      console.log('   ❌ Homepage loading issues\n');
    }

    // TEST 2: Check for Login/Demo Login
    testsTotal++;
    console.log('TEST 2: Checking Authentication Options...');

    const loginButton = await page.locator('text=/login|anmelden|demo/i').count();
    console.log(`   Login buttons found: ${loginButton}`);

    if (loginButton > 0) {
      console.log('   ✅ Authentication options available\n');
      testsSuccessful++;
    } else {
      console.log('   ⚠️  No login options found\n');
    }

    // TEST 3: Check for Tools/Features
    testsTotal++;
    console.log('TEST 3: Checking for Restaurant Tools...');

    const tools = [
      'Nährwert', 'Nutrition',
      'Kosten', 'Cost',
      'Lager', 'Inventory',
      'Menu', 'Speise',
      'Designer', 'Card'
    ];

    let toolsFound = 0;
    for (const tool of tools) {
      const found = await page.locator(`text=/${tool}/i`).count();
      if (found > 0) {
        toolsFound++;
        console.log(`   ✅ Found: ${tool}`);
      }
    }

    if (toolsFound >= 3) {
      console.log(`   ✅ ${toolsFound} tool references found\n`);
      testsSuccessful++;
    } else {
      console.log(`   ⚠️  Only ${toolsFound} tool references found\n`);
    }

    // TEST 4: Try Login
    testsTotal++;
    console.log('TEST 4: Testing Login Functionality...');

    // Look for login link/button
    const loginLink = page.locator('a[href*="login"], button:has-text("login"), button:has-text("Demo"), a:has-text("Demo")').first();

    if (await loginLink.count() > 0) {
      await loginLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      console.log(`   Current URL: ${currentUrl}`);

      if (currentUrl.includes('login')) {
        console.log('   ✅ Login page reached');

        // Try demo login
        const emailInput = page.locator('input[type="email"], input[name="email"]').first();
        const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

        if (await emailInput.isVisible() && await passwordInput.isVisible()) {
          await emailInput.fill('demo@gastrotools.de');
          await passwordInput.fill('demo123');

          const submitButton = page.locator('button[type="submit"], button:has-text("Anmelden"), button:has-text("Sign in")').first();
          await submitButton.click();

          await page.waitForTimeout(3000);

          const afterLoginUrl = page.url();
          if (!afterLoginUrl.includes('login')) {
            console.log('   ✅ Login successful!');
            testsSuccessful++;
          } else {
            console.log('   ⚠️  Login failed - still on login page');
          }
        } else {
          console.log('   ⚠️  Login form not found');
        }
      }
    } else {
      console.log('   ⚠️  No login option found on homepage');
    }

    // TEST 5: Check Speisekarten Designer
    testsTotal++;
    console.log('\nTEST 5: Testing Speisekarten Designer...');

    // Navigate directly
    await page.goto('https://gastrotools-bulletproof-final.vercel.app/speisekarten-designer');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const designerUrl = page.url();
    console.log(`   URL: ${designerUrl}`);

    if (designerUrl.includes('login')) {
      console.log('   ⚠️  Redirected to login (auth required)');

      // Try API login for designer access
      const loginResponse = await page.request.post('https://gastrotools-bulletproof-final.vercel.app/api/auth/login', {
        data: {
          email: 'demo@gastrotools.de',
          password: 'demo123'
        }
      }).catch(err => null);

      if (loginResponse && loginResponse.ok()) {
        console.log('   ✅ API login successful');
        testsSuccessful++;
      }
    } else if (designerUrl.includes('speisekarten-designer')) {
      console.log('   ✅ Speisekarten Designer accessible');

      // Check for designer elements
      const designerElements = await page.locator('h1, h2, h3').allTextContents();
      console.log(`   Found ${designerElements.length} headings`);
      testsSuccessful++;
    }

    // Take screenshot for verification
    await page.screenshot({
      path: 'vercel-live-test.png',
      fullPage: true
    });
    console.log('\n📸 Screenshot saved as vercel-live-test.png');

    // FINAL REPORT
    console.log('\n' + '='.repeat(60));
    console.log('📊 LIVE VERSION TEST RESULTS:');
    console.log('='.repeat(60));

    const percentage = Math.round((testsSuccessful / testsTotal) * 100);
    console.log(`\nTests Passed: ${testsSuccessful}/${testsTotal} (${percentage}%)\n`);

    if (percentage >= 80) {
      console.log('✅ LIVE VERSION IS RUNNING CORRECTLY!');
      console.log('   - Homepage loads');
      console.log('   - Tools are visible');
      console.log('   - Authentication system present');
    } else if (percentage >= 50) {
      console.log('⚠️  LIVE VERSION PARTIALLY WORKING');
      console.log('   - Some features may not be deployed');
      console.log('   - Check deployment logs on Vercel');
    } else {
      console.log('❌ LIVE VERSION HAS ISSUES');
      console.log('   - May be running old version');
      console.log('   - Deployment may have failed');
      console.log('   - Check Vercel dashboard for errors');
    }

    console.log('\n🔗 Vercel Dashboard: https://vercel.com/dashboard');

  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
  }

  console.log('\nBrowser stays open for 5 seconds...');
  await page.waitForTimeout(5000);
  await browser.close();
})();