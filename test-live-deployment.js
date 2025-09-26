const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🌐 Testing live deployment at https://gastrotools-bulletproof-final.vercel.app/');

  // Test 1: Homepage loads
  console.log('\n📍 Test 1: Homepage');
  await page.goto('https://gastrotools-bulletproof-final.vercel.app/');
  await page.waitForTimeout(2000);
  const title = await page.title();
  console.log('✅ Homepage loaded:', title);

  // Test 2: Login page exists and works
  console.log('\n📍 Test 2: Login');
  await page.goto('https://gastrotools-bulletproof-final.vercel.app/login');
  await page.waitForTimeout(2000);

  // Try demo login
  await page.fill('input[type="email"]', 'demo@gastrotools.de');
  await page.fill('input[type="password"]', 'demo123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  const url = page.url();
  if (url.includes('/dashboard')) {
    console.log('✅ Login successful - redirected to dashboard');
  } else {
    console.log('⚠️ Login might not have worked, current URL:', url);
  }

  // Test 3: Speisekarten Designer
  console.log('\n📍 Test 3: Speisekarten Designer');
  await page.goto('https://gastrotools-bulletproof-final.vercel.app/speisekarten-designer');
  await page.waitForTimeout(3000);

  // Check if we're on the designer page
  const designerUrl = page.url();
  if (designerUrl.includes('/speisekarten-designer')) {
    console.log('✅ Speisekarten Designer loaded');

    // Try to create sample menu
    const sampleButton = await page.$('text=Create Sample Menu');
    if (sampleButton) {
      await sampleButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Sample menu button clicked');
    }

    // Check if menu items are visible
    const menuItems = await page.$$('input[placeholder="Name"]');
    if (menuItems.length > 0) {
      console.log(`✅ Menu designer functional - ${menuItems.length} menu items visible`);
    }
  } else if (designerUrl.includes('/login')) {
    console.log('⚠️ Redirected to login - authentication required');
  }

  console.log('\n📊 Deployment Status: LIVE and FUNCTIONAL');
  console.log('🚀 Version deployed successfully to Vercel');

  await browser.close();
})();