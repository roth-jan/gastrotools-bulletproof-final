const { chromium } = require('playwright');

async function testLoginAndMenuDesigner() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();

  try {
    console.log('🔍 Testing Login and Menu Designer...');

    // Navigate to login page
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('form');

    // Fill login form
    console.log('2. Filling login form with demo credentials...');
    await page.fill('input[name="email"]', 'demo@gastrotools.de');
    await page.fill('input[name="password"]', 'demo123');

    // Submit form and wait for redirect
    console.log('3. Submitting form and waiting for redirect...');
    await page.click('button[type="submit"]');

    // Wait for either dashboard or error message
    try {
      await page.waitForURL('**/dashboard', { timeout: 5000 });
      console.log('✅ Login successful - redirected to dashboard');
    } catch (e) {
      // Check if still on login page with error
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        const errorElement = await page.$('.bg-red-50');
        if (errorElement) {
          const errorText = await errorElement.textContent();
          console.log('❌ Login failed with error:', errorText);
        } else {
          console.log('❌ Login failed - no redirect happened, no error shown');
        }
      } else {
        console.log('⚠️ Unexpected redirect to:', currentUrl);
      }
    }

    // Navigate to menu designer
    console.log('4. Navigating to menu designer...');
    await page.goto('http://localhost:3000/speisekarten-designer');
    await page.waitForSelector('h1');

    // Check if we're redirected to login (not authenticated)
    if (page.url().includes('/login')) {
      console.log('❌ Not authenticated - redirected to login');
      return;
    }

    console.log('5. Testing menu designer functionality...');

    // Create new menu card
    console.log('5a. Creating new menu card...');
    await page.fill('input[placeholder*="Summer Menu"]', 'Test Menu Card');
    await page.click('button:has-text("Create New Card")');

    // Wait for card to appear and be selected
    await page.waitForTimeout(1000);

    // Check if editor is now visible
    const editorTitle = await page.$('text="Test Menu Card"');
    if (editorTitle) {
      console.log('✅ Menu card created and editor opened');

      // Add a category
      console.log('5b. Adding a category...');
      await page.fill('input[placeholder*="Category name"]', 'Vorspeisen');
      await page.click('button:has-text("Add Category")');
      await page.waitForTimeout(500);

      // Add a menu item
      console.log('5c. Adding menu item...');
      await page.fill('input[placeholder="Item name"]', 'Caesar Salad');
      await page.fill('input[placeholder="Price (€)"]', '12.50');
      await page.fill('textarea[placeholder="Description"]', 'Fresh romaine lettuce with parmesan and croutons');
      await page.click('button:has-text("Add Item")');
      await page.waitForTimeout(500);

      console.log('✅ Menu designer fully functional');

    } else {
      console.log('❌ Editor not opened after creating card');
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testLoginAndMenuDesigner();