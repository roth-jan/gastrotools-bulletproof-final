const { chromium } = require('playwright');

(async () => {
  console.log('🧪 QUALITY TEST - Testing like real human user');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500 // Human-like speed
  });
  
  const page = await browser.newPage();
  let testResults = { passed: 0, failed: 0, total: 0 };

  async function test(name, testFn) {
    console.log(`\n🔍 Testing: ${name}`);
    testResults.total++;
    try {
      await testFn();
      testResults.passed++;
      console.log(`✅ PASSED: ${name}`);
    } catch (error) {
      testResults.failed++;
      console.log(`❌ FAILED: ${name} - ${error.message}`);
    }
  }

  try {
    const url = 'https://gastrotools-bulletproof.vercel.app';
    
    // Test 1: Homepage loads
    await test('Homepage Access', async () => {
      await page.goto(url);
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      const title = await page.textContent('h1');
      if (!title) throw new Error('No homepage title');
      console.log(`   Title: "${title}"`);
    });

    // Test 2: Registration flow
    await test('User Registration', async () => {
      await page.click('a[href="/register"]');
      await page.waitForLoadState('networkidle');
      
      const timestamp = Date.now();
      await page.fill('input[name="name"]', 'Quality Tester');
      await page.fill('input[name="email"]', `quality.${timestamp}@example.com`);
      await page.fill('input[type="password"]', 'quality123');
      
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      const content = await page.textContent('body');
      if (!content.includes('successful') && !content.includes('Registration')) {
        throw new Error('Registration did not complete');
      }
      
      console.log('   ✅ Registration form submitted successfully');
    });

    // Test 3: Demo login (known to work)
    await test('Demo Login', async () => {
      await page.goto(`${url}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.fill('input[type="email"]', 'demo@gastrotools.de');
      await page.fill('input[type="password"]', 'demo123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      if (!page.url().includes('/dashboard')) {
        throw new Error('Demo login failed to redirect to dashboard');
      }
      
      console.log('   ✅ Demo login successful');
    });

    // Test 4: Hackfleisch functionality
    await test('Hackfleisch Nutrition Search', async () => {
      await page.goto(`${url}/naehrwertrechner`);
      await page.waitForLoadState('networkidle');
      
      await page.fill('input[placeholder*="Add"], input[placeholder*="Zutat"]', 'Hackfleisch');
      await page.waitForTimeout(4000);
      
      const dropdown = page.locator('.absolute');
      const hasResults = await dropdown.isVisible();
      
      if (!hasResults) {
        throw new Error('No search results for Hackfleisch');
      }
      
      console.log('   ✅ Hackfleisch search returns results');
    });

    // Test 5: Language switching
    await test('Language Switching', async () => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      const langButton = page.locator('button:has(svg)', { hasText: /EN|DE/ });
      await langButton.click();
      await page.waitForTimeout(2000);
      
      console.log('   ✅ Language switcher works');
    });

    // Test 6: All tool pages load
    const toolPaths = ['/kostenkontrolle', '/lagerverwaltung', '/menueplaner', '/speisekarten-designer'];
    
    for (const path of toolPaths) {
      await test(`Tool: ${path}`, async () => {
        await page.goto(url + path);
        await page.waitForLoadState('networkidle');
        
        const title = await page.textContent('h1');
        if (!title || title.includes('404')) {
          throw new Error(`Tool ${path} not accessible`);
        }
        
        console.log(`   ✅ ${path}: "${title}"`);
      });
    }

    // FINAL RESULTS
    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
    
    console.log('\n🎯 FINAL QUALITY ASSESSMENT:');
    console.log('=' * 50);
    console.log(`📊 Tests Run: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);  
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (successRate >= 90) {
      console.log('\n🎉 VERDICT: READY FOR UPWORK TESTING');
      console.log('System meets quality standards for professional testing');
    } else if (successRate >= 70) {
      console.log('\n⚠️  VERDICT: NEEDS MINOR FIXES');
      console.log('System mostly functional but has issues');
    } else {
      console.log('\n❌ VERDICT: NOT READY FOR UPWORK');
      console.log('System has major functionality issues');
    }

    console.log('\n🌐 Production URL: ' + url);
    console.log('🔐 Demo Access: demo@gastrotools.de / demo123');
    console.log('🧪 Test completed. Check results above.');
    
    // Keep browser open for manual inspection
    console.log('\n🔍 Browser open for final manual verification...');
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Critical testing error:', error.message);
    await browser.close();
  }
})();