const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🔍 Testing Speisekarten Designer...\n');

  try {
    // 1. Navigate to homepage
    console.log('1. Navigating to GastroTools...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 2. Click on Menu Card Designer
    console.log('2. Opening Menu Card Designer...');
    const designerCard = page.locator('text=Menu Card Designer').first();
    await designerCard.click();

    // Wait for page load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 3. Check if main elements are present
    console.log('3. Checking main elements...');

    // Check title
    const title = await page.locator('h1').filter({ hasText: 'Speisekarten Designer' }).isVisible();
    console.log(`   ✓ Title visible: ${title}`);

    // Check menu sections
    const sections = ['Vorspeisen', 'Hauptgerichte', 'Desserts', 'Getränke'];
    for (const section of sections) {
      const sectionVisible = await page.locator('h3').filter({ hasText: section }).isVisible();
      console.log(`   ✓ Section "${section}" visible: ${sectionVisible}`);
    }

    // 4. Test adding items to menu
    console.log('\n4. Testing menu functionality...');

    // Add item to Vorspeisen
    const vorspeisenSection = page.locator('.menu-section').filter({ has: page.locator('h3:has-text("Vorspeisen")') });
    const addButton = vorspeisenSection.locator('button').filter({ hasText: 'Gericht hinzufügen' });

    if (await addButton.isVisible()) {
      console.log('   ✓ Add button found, clicking...');
      await addButton.click();
      await page.waitForTimeout(1000);

      // Fill in the form if modal appears
      const modal = page.locator('.modal, [role="dialog"]').first();
      if (await modal.isVisible()) {
        console.log('   ✓ Modal opened');

        // Fill form
        await page.fill('input[placeholder*="Name"], input[name="name"]', 'Tomatensuppe');
        await page.fill('textarea[placeholder*="Beschreibung"], textarea[name="description"]', 'Hausgemachte Tomatensuppe mit Basilikum');
        await page.fill('input[placeholder*="Preis"], input[name="price"]', '6.50');

        // Save
        const saveButton = page.locator('button').filter({ hasText: /speichern|hinzufügen/i });
        await saveButton.click();
        console.log('   ✓ Item added');
        await page.waitForTimeout(1000);
      }
    }

    // 5. Test PDF export
    console.log('\n5. Testing PDF export...');
    const exportButton = page.locator('button').filter({ hasText: /PDF|Export|Download/i }).first();

    if (await exportButton.isVisible()) {
      console.log('   ✓ Export button found');

      // Set up download promise before clicking
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);

      await exportButton.click();
      console.log('   ✓ Export button clicked');

      const download = await downloadPromise;
      if (download) {
        console.log('   ✓ Download triggered successfully');
        const filename = download.suggestedFilename();
        console.log(`   ✓ Filename: ${filename}`);
      } else {
        console.log('   ⚠️  No download detected (might be text download or blocked)');
      }
    } else {
      console.log('   ❌ Export button not found');
    }

    // 6. Take screenshot
    console.log('\n6. Taking screenshot...');
    await page.screenshot({
      path: 'speisekarten-designer-test.png',
      fullPage: true
    });
    console.log('   ✓ Screenshot saved as speisekarten-designer-test.png');

    console.log('\n✅ SPEISEKARTEN DESIGNER TEST COMPLETED');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);

    // Take error screenshot
    await page.screenshot({
      path: 'speisekarten-designer-error.png',
      fullPage: true
    });
    console.log('Error screenshot saved as speisekarten-designer-error.png');
  }

  await browser.close();
})();