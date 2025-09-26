const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🔍 Testing Speisekarten Designer Direct Navigation...\n');

  try {
    // 1. Navigate directly to the designer page
    console.log('1. Navigating directly to /speisekarten-designer...');
    await page.goto('http://localhost:3000/speisekarten-designer');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('   ✓ Page loaded');
    console.log(`   URL: ${page.url()}`);

    // 2. Check page title
    console.log('\n2. Checking page content...');
    const title = await page.title();
    console.log(`   Page title: ${title}`);

    // 3. Check for main heading
    const h1Count = await page.locator('h1').count();
    console.log(`   Found ${h1Count} h1 elements`);

    if (h1Count > 0) {
      const h1Text = await page.locator('h1').first().textContent();
      console.log(`   Main heading: ${h1Text}`);
    }

    // 4. Check for menu sections
    console.log('\n3. Looking for menu sections...');
    const sections = ['Vorspeisen', 'Hauptgerichte', 'Desserts', 'Getränke'];

    for (const section of sections) {
      const found = await page.locator(`text=${section}`).count() > 0;
      console.log(`   ${section}: ${found ? '✅ Found' : '❌ Not found'}`);
    }

    // 5. Check for interactive elements
    console.log('\n4. Checking for interactive elements...');
    const buttons = await page.locator('button').count();
    console.log(`   Buttons found: ${buttons}`);

    const inputs = await page.locator('input, textarea').count();
    console.log(`   Input fields found: ${inputs}`);

    // 6. Try to add a dish
    console.log('\n5. Testing functionality...');
    const addButtons = await page.locator('button').filter({ hasText: /hinzufügen|add|neu/i });

    if (await addButtons.count() > 0) {
      console.log(`   Found ${await addButtons.count()} add buttons`);
      await addButtons.first().click();
      console.log('   ✓ Clicked add button');
      await page.waitForTimeout(1000);

      // Check if a modal or form appeared
      const modals = await page.locator('.modal, [role="dialog"], .fixed').count();
      console.log(`   Modals/dialogs found: ${modals}`);
    } else {
      console.log('   ❌ No add buttons found');
    }

    // 7. Check for export functionality
    console.log('\n6. Checking for export functionality...');
    const exportRelated = await page.locator('button').filter({ hasText: /export|pdf|download|drucken/i });

    if (await exportRelated.count() > 0) {
      console.log(`   ✅ Found ${await exportRelated.count()} export-related buttons`);
    } else {
      console.log('   ❌ No export functionality found');
    }

    // 8. Take screenshot
    console.log('\n7. Taking screenshot...');
    await page.screenshot({
      path: 'speisekarten-designer-direct.png',
      fullPage: true
    });
    console.log('   ✓ Screenshot saved as speisekarten-designer-direct.png');

    console.log('\n✅ TEST COMPLETED SUCCESSFULLY');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    await page.screenshot({
      path: 'speisekarten-designer-error-direct.png',
      fullPage: true
    });
  }

  await browser.close();
})();