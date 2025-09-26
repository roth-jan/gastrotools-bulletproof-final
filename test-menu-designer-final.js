const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🔍 Testing Menu Card Designer...\n');

  try {
    // 1. Navigate to homepage
    console.log('1. Navigating to GastroTools...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 2. Click on Menu Card Designer - try different selectors
    console.log('2. Opening Menu Card Designer...');

    // Try clicking the "Try Tool" button under Menu Card Designer
    const tryToolButton = page.locator('h3:has-text("Menu Card Designer") ~ button:has-text("Try Tool")');

    if (await tryToolButton.isVisible()) {
      await tryToolButton.click();
      console.log('   ✓ Clicked Try Tool button');
    } else {
      // Alternative: Click on the card itself
      await page.locator('text=Menu Card Designer').click();
      console.log('   ✓ Clicked on Menu Card Designer text');
    }

    // Wait for navigation
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 3. Verify we're on the designer page
    console.log('\n3. Verifying page loaded...');
    const url = page.url();
    console.log(`   Current URL: ${url}`);

    if (url.includes('speisekarten-designer')) {
      console.log('   ✅ Successfully navigated to Menu Designer page');
    } else {
      console.log('   ⚠️  Not on designer page, checking for modal...');

      // Check if it opened in a modal
      const modal = page.locator('.modal, [role="dialog"], .fixed.inset-0').first();
      if (await modal.isVisible()) {
        console.log('   ✓ Designer opened in modal');
      }
    }

    // 4. Check for main elements (adjust selectors based on actual implementation)
    console.log('\n4. Checking for menu designer elements...');

    // Look for any menu-related content
    const menuContent = await page.locator('text=/menu|speise|gericht|card/i').count();
    console.log(`   Found ${menuContent} menu-related elements`);

    // Check for input fields or forms
    const inputs = await page.locator('input, textarea').count();
    console.log(`   Found ${inputs} input fields`);

    // Check for buttons
    const buttons = await page.locator('button').count();
    console.log(`   Found ${buttons} buttons`);

    // 5. Test functionality
    console.log('\n5. Testing functionality...');

    // Try to find and click an "Add" button
    const addButtons = page.locator('button').filter({ hasText: /add|hinzu|neu|create/i });
    if (await addButtons.count() > 0) {
      await addButtons.first().click();
      console.log('   ✓ Clicked add button');
      await page.waitForTimeout(1000);
    }

    // 6. Check for export functionality
    console.log('\n6. Checking export functionality...');
    const exportButtons = page.locator('button').filter({ hasText: /export|pdf|download|speichern/i });
    if (await exportButtons.count() > 0) {
      console.log(`   ✓ Found ${await exportButtons.count()} export-related buttons`);
    } else {
      console.log('   ⚠️  No export buttons found');
    }

    // 7. Take final screenshot
    console.log('\n7. Taking screenshot...');
    await page.screenshot({
      path: 'menu-designer-final.png',
      fullPage: true
    });
    console.log('   ✓ Screenshot saved as menu-designer-final.png');

    console.log('\n✅ MENU CARD DESIGNER TEST COMPLETED');
    console.log('\n📋 SUMMARY:');
    console.log(`   - Page loaded: ${url.includes('speisekarten-designer') ? 'Yes' : 'No'}`);
    console.log(`   - Interactive elements found: ${inputs > 0 ? 'Yes' : 'No'}`);
    console.log(`   - Export functionality: ${await exportButtons.count() > 0 ? 'Available' : 'Not found'}`);

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);

    // Take error screenshot
    await page.screenshot({
      path: 'menu-designer-error-final.png',
      fullPage: true
    });
    console.log('Error screenshot saved as menu-designer-error-final.png');
  }

  await browser.close();
})();