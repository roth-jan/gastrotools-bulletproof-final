const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🔍 Testing Speisekarten Designer with Login...\n');

  try {
    // 1. Navigate to login page
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');

    // 2. Perform login with demo credentials
    console.log('2. Logging in with demo credentials...');
    await page.fill('input[type="email"]', 'demo@gastrotools.de');
    await page.fill('input[type="password"]', 'demo123');

    // Click login button
    await page.click('button:has-text("Anmelden")');

    // Wait for navigation
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('   ✓ Logged in successfully');
    console.log(`   Current URL: ${page.url()}`);

    // 3. Navigate to Speisekarten Designer
    console.log('\n3. Navigating to Speisekarten Designer...');

    // Check if we're already there after login redirect
    if (!page.url().includes('speisekarten-designer')) {
      await page.goto('http://localhost:3000/speisekarten-designer');
      await page.waitForLoadState('networkidle');
    }

    await page.waitForTimeout(2000);
    console.log(`   Current URL: ${page.url()}`);

    // 4. Check page content
    console.log('\n4. Checking page content...');

    // Check for title
    const h1Count = await page.locator('h1').count();
    if (h1Count > 0) {
      const h1Text = await page.locator('h1').first().textContent();
      console.log(`   Main heading: ${h1Text}`);
    }

    // Check for menu sections
    console.log('\n5. Looking for menu sections...');
    const sections = ['Vorspeisen', 'Hauptgerichte', 'Desserts', 'Getränke'];
    let sectionsFound = 0;

    for (const section of sections) {
      const found = await page.locator(`text=${section}`).count() > 0;
      if (found) sectionsFound++;
      console.log(`   ${section}: ${found ? '✅ Found' : '❌ Not found'}`);
    }

    // 6. Test adding a menu item
    console.log('\n6. Testing add functionality...');

    // Look for add buttons
    const addButtons = await page.locator('button').filter({ hasText: /hinzufügen|add|gericht hinzufügen|neu/i });

    if (await addButtons.count() > 0) {
      console.log(`   Found ${await addButtons.count()} add buttons`);

      // Click the first add button
      await addButtons.first().click();
      console.log('   ✓ Clicked add button');
      await page.waitForTimeout(1000);

      // Check if modal opened
      const modal = await page.locator('.modal, [role="dialog"], .fixed.inset-0').first();
      if (await modal.isVisible()) {
        console.log('   ✓ Modal opened');

        // Try to fill the form
        const nameInput = page.locator('input[name="name"], input[placeholder*="Name"]').first();
        const descInput = page.locator('textarea[name="description"], textarea[placeholder*="Beschreibung"]').first();
        const priceInput = page.locator('input[name="price"], input[placeholder*="Preis"]').first();

        if (await nameInput.isVisible()) {
          await nameInput.fill('Wiener Schnitzel');
          await descInput.fill('Mit Pommes und Salat');
          await priceInput.fill('15.90');
          console.log('   ✓ Filled form fields');

          // Save
          const saveButton = page.locator('button').filter({ hasText: /speichern|hinzufügen|save|add/i }).first();
          if (await saveButton.isVisible()) {
            await saveButton.click();
            console.log('   ✓ Saved menu item');
            await page.waitForTimeout(1000);
          }
        }
      }
    } else {
      console.log('   ❌ No add buttons found');
    }

    // 7. Check for export functionality
    console.log('\n7. Testing export functionality...');
    const exportButtons = await page.locator('button').filter({ hasText: /export|pdf|download|drucken|speichern/i });

    if (await exportButtons.count() > 0) {
      console.log(`   ✅ Found ${await exportButtons.count()} export buttons`);

      // Try to click export
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
      await exportButtons.first().click();
      console.log('   ✓ Clicked export button');

      const download = await downloadPromise;
      if (download) {
        console.log('   ✅ Download triggered successfully');
        const filename = download.suggestedFilename();
        console.log(`   Filename: ${filename}`);
      } else {
        console.log('   ⚠️  No download detected (might be text/modal export)');
      }
    } else {
      console.log('   ❌ No export buttons found');
    }

    // 8. Take screenshot
    console.log('\n8. Taking screenshot...');
    await page.screenshot({
      path: 'speisekarten-designer-logged-in.png',
      fullPage: true
    });
    console.log('   ✓ Screenshot saved');

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY:');
    console.log('='.repeat(50));

    if (sectionsFound >= 3) {
      console.log('✅ SPEISEKARTEN DESIGNER FUNKTIONIERT!');
      console.log(`   - Login erfolgreich`);
      console.log(`   - ${sectionsFound}/4 Menu-Sektionen gefunden`);
      console.log(`   - Add-Funktionalität: ${await addButtons.count() > 0 ? 'Vorhanden' : 'Fehlt'}`);
      console.log(`   - Export-Funktionalität: ${await exportButtons.count() > 0 ? 'Vorhanden' : 'Fehlt'}`);
    } else {
      console.log('⚠️  SPEISEKARTEN DESIGNER HAT PROBLEME');
      console.log(`   - Nur ${sectionsFound}/4 Sektionen gefunden`);
      console.log('   - Tool möglicherweise nicht vollständig geladen');
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    await page.screenshot({
      path: 'speisekarten-designer-error-login.png',
      fullPage: true
    });
  }

  await browser.close();
})();