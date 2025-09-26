const { chromium } = require('playwright');

async function findCorrectProduction() {
  console.log('🔍 FINDING CORRECT PRODUCTION VERSION');
  console.log('====================================');
  console.log('Looking for deployment with ID containing: 6spU1AQjT');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Test multiple possible URLs
    const testUrls = [
      'https://gastrotools-bulletproof.vercel.app',
      'https://gastrotools-bulletproof-final.vercel.app', 
      'https://gastrotools-bulletproof-7tqapgr1f-jhroth-7537s-projects.vercel.app',
      'https://gastrotools-bulletproof-j7npn7ubl-jhroth-7537s-projects.vercel.app',
      'https://gastrotools-bulletproof-4yeppx6nc-jhroth-7537s-projects.vercel.app'
    ];
    
    console.log('\n🧪 Testing all possible URLs for current version...');
    
    for (const url of testUrls) {
      try {
        const response = await page.goto(url, { timeout: 8000 });
        
        if (response && response.status() === 200) {
          // Check version by testing a fix
          await page.goto(`${url}/login`);
          await page.fill('input[type="email"]', 'demo@gastrotools.de');
          await page.fill('input[type="password"]', 'demo123');
          await page.click('button[type="submit"]');
          await page.waitForTimeout(3000);
          
          await page.goto(`${url}/kostenkontrolle`);
          
          // Test negative price validation (my fix)
          await page.fill('input[placeholder*="Tomatoes"]', 'Version Test');
          await page.fill('input[placeholder="0.00"]', '-999');
          await page.click('button:has-text("Add Entry")');
          await page.waitForTimeout(2000);
          
          const hasErrorMessage = await page.locator('.text-red-500').count() > 0;
          const hasMyFix = await page.locator('text="Unit price must be greater than 0"').count() > 0;
          
          console.log(`${url.split('/')[2]}:`);
          console.log(`   Status: ${response.status()}`);
          console.log(`   Has error display: ${hasErrorMessage ? '✅' : '❌'}`);
          console.log(`   Has my fix: ${hasMyFix ? '✅ LATEST' : '❌ OLD'}`);
          
          // Check deployment ID in headers
          const deploymentId = response.headers()['x-vercel-id'];
          console.log(`   Vercel ID: ${deploymentId || 'Unknown'}`);
          
          if (deploymentId && deploymentId.includes('6spU1AQjT')) {
            console.log(`   🎯 FOUND TARGET DEPLOYMENT: ${url}`);
          }
          
        } else {
          console.log(`${url}: HTTP ${response?.status() || 'ERROR'}`);
        }
        
      } catch (error) {
        console.log(`${url}: ${error.message}`);
      }
    }
    
    // Check the main domain specifically
    console.log('\n🔍 Checking main domain details...');
    const mainResponse = await page.goto('https://gastrotools-bulletproof.vercel.app');
    const mainId = mainResponse?.headers()['x-vercel-id'];
    
    console.log(`Main domain (gastrotools-bulletproof.vercel.app):`);
    console.log(`   Current deployment ID: ${mainId}`);
    console.log(`   Looking for: 6spU1AQjT`);
    console.log(`   Match: ${mainId && mainId.includes('6spU1AQjT') ? '✅ YES' : '❌ NO'}`);
    
    if (mainId && mainId.includes('6spU1AQjT')) {
      console.log('\n🎯 TESTING THE CORRECT PRODUCTION VERSION...');
      
      // Test the exact user scenario on this version
      await page.goto('https://gastrotools-bulletproof.vercel.app/login');
      await page.fill('input[type="email"]', 'demo@gastrotools.de');
      await page.fill('input[type="password"]', 'demo123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      await page.goto('https://gastrotools-bulletproof.vercel.app/kostenkontrolle');
      
      await page.fill('input[placeholder*="Tomatoes"]', 'Final Production Test');
      await page.fill('input[placeholder="0.00"]', '-10');
      await page.click('button:has-text("Add Entry")');
      await page.waitForTimeout(2000);
      
      const finalErrorCheck = await page.locator('.text-red-500').count();
      const finalEntryCheck = await page.locator('text="Final Production Test"').count();
      
      console.log(`   FINAL VALIDATION CHECK:`);
      console.log(`   Error messages shown: ${finalErrorCheck > 0 ? '✅' : '❌'}`);
      console.log(`   Entry wrongly saved: ${finalEntryCheck > 0 ? '❌ BUG' : '✅ PREVENTED'}`);
      
      if (finalErrorCheck > 0 && finalEntryCheck === 0) {
        console.log('\n✅ PRODUCTION VERSION: My fixes are working!');
      } else {
        console.log('\n🚨 PRODUCTION VERSION: Still has bugs - fixes not deployed');
      }
    }
    
  } catch (error) {
    console.error('Production finding error:', error);
  } finally {
    await browser.close();
  }
}

findCorrectProduction();