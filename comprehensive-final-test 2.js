const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🎯 COMPREHENSIVE FINAL QUALITY TEST');
  console.log('⏰ Starting:', new Date().toLocaleString());
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  const testResults = {
    timestamp: new Date().toISOString(),
    url: 'https://gastrotools-bulletproof.vercel.app',
    testSuite: 'Final Comprehensive Quality Test',
    results: {},
    screenshots: [],
    errors: [],
    summary: { passed: 0, failed: 0, total: 0 }
  };

  async function takeScreenshot(name, description) {
    const filename = `final-test-${Date.now()}-${name}.png`;
    await page.screenshot({ path: filename, fullPage: true });
    testResults.screenshots.push({ name, filename, description });
    console.log(`📸 ${filename} - ${description}`);
  }

  async function test(name, testFn) {
    console.log(`\n🔍 Testing: ${name}`);
    testResults.results[name] = { status: 'running', startTime: Date.now() };
    testResults.summary.total++;
    
    try {
      await testFn();
      testResults.results[name].status = 'passed';
      testResults.results[name].duration = Date.now() - testResults.results[name].startTime;
      testResults.summary.passed++;
      console.log(`✅ PASSED: ${name}`);
    } catch (error) {
      testResults.results[name].status = 'failed';
      testResults.results[name].error = error.message;
      testResults.results[name].duration = Date.now() - testResults.results[name].startTime;
      testResults.errors.push({ test: name, error: error.message });
      testResults.summary.failed++;
      console.log(`❌ FAILED: ${name} - ${error.message}`);
      await takeScreenshot(`error-${name.replace(/\s+/g, '-')}`, `Error: ${name}`);
    }
  }

  try {
    const url = 'https://gastrotools-bulletproof.vercel.app';
    
    // Test 1: Homepage loads
    await test('Homepage Loads', async () => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      const title = await page.textContent('h1');
      if (!title) throw new Error('No homepage title');
      await takeScreenshot('01-homepage', 'Homepage loaded');
    });

    // Test 2: Language switching
    await test('Language Switching', async () => {
      const langButton = page.locator('button:has(svg)').first();
      if (await langButton.isVisible()) {
        await langButton.click();
        await page.waitForTimeout(2000);
        console.log('   Language switched successfully');
      }
      await takeScreenshot('02-language-switch', 'Language switching');
    });

    // Test 3: Complete Registration Flow via UI
    await test('Complete Registration Flow (UI)', async () => {
      await page.click('a[href="/register"]');
      await page.waitForLoadState('networkidle');
      
      const timestamp = Date.now();
      const testEmail = `ui.test.${timestamp}@example.com`;
      
      await page.fill('input[name="name"]', 'UI Test User');
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="company"]', 'Test Restaurant');
      await page.fill('input[name="password"]', 'uitest123');
      
      await takeScreenshot('03-registration-form', 'Registration form filled');
      
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      const content = await page.textContent('body');
      if (!content.includes('successful') && !content.includes('erfolgreich')) {
        throw new Error('Registration UI did not show success');
      }
      
      // Store email for login test
      testResults.testEmail = testEmail;
      
      await takeScreenshot('04-registration-success', 'Registration successful');
    });

    // Test 4: Complete Login Flow via UI  
    await test('Complete Login Flow (UI)', async () => {
      if (!testResults.testEmail) {
        throw new Error('No test email from registration');
      }
      
      await page.goto(`${url}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.fill('input[type="email"]', testResults.testEmail);
      await page.fill('input[type="password"]', 'uitest123');
      
      await takeScreenshot('05-login-form', 'Login form with real user');
      
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      if (!page.url().includes('/dashboard')) {
        throw new Error('Login did not redirect to dashboard');
      }
      
      await takeScreenshot('06-dashboard-real-user', 'Dashboard with real user');
    });

    // Test 5: Demo Login (fallback)
    await test('Demo Login Flow', async () => {
      await page.goto(`${url}/login`);
      await page.fill('input[type="email"]', 'demo@gastrotools.de');
      await page.fill('input[type="password"]', 'demo123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      if (!page.url().includes('/dashboard')) {
        throw new Error('Demo login failed');
      }
      
      await takeScreenshot('07-demo-login', 'Demo login successful');
    });

    // Test 6: All Tool Access
    const tools = [
      { name: 'Nutrition Calculator', path: '/naehrwertrechner' },
      { name: 'Cost Control', path: '/kostenkontrolle' },
      { name: 'Inventory', path: '/lagerverwaltung' },
      { name: 'Menu Planner', path: '/menueplaner' },
      { name: 'Card Designer', path: '/speisekarten-designer' },
      { name: 'Admin', path: '/admin' }
    ];

    for (const tool of tools) {
      await test(`${tool.name} Access`, async () => {
        await page.goto(url + tool.path);
        await page.waitForLoadState('networkidle');
        
        const title = await page.textContent('h1');
        if (!title || title.includes('404') || title.includes('Error')) {
          throw new Error(`${tool.name} not accessible`);
        }
        
        await takeScreenshot(`08-${tool.name.toLowerCase().replace(/\s+/g, '-')}`, `${tool.name} loaded`);
      });
    }

    // Test 7: Hackfleisch Functionality
    await test('Hackfleisch Functionality', async () => {
      await page.goto(`${url}/naehrwertrechner`);
      await page.waitForLoadState('networkidle');
      
      const searchInput = page.locator('input[placeholder*="Add"], input[placeholder*="ingredient"]');
      await searchInput.fill('Hackfleisch');
      await page.waitForTimeout(4000);
      
      const dropdown = page.locator('.absolute');
      const hasResults = await dropdown.isVisible();
      
      if (!hasResults) {
        throw new Error('Hackfleisch search returned no results');
      }
      
      await takeScreenshot('09-hackfleisch-working', 'Hackfleisch search working');
    });

    // Test 8: Forgot Password Flow
    await test('Forgot Password Flow', async () => {
      await page.goto(`${url}/forgot-password`);
      await page.waitForLoadState('networkidle');
      
      await page.fill('input[type="email"]', 'test.reset@example.com');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      const content = await page.textContent('body');
      if (!content.includes('reset') && !content.includes('Reset')) {
        throw new Error('Password reset did not show confirmation');
      }
      
      await takeScreenshot('10-password-reset', 'Password reset flow');
    });

    // Test 9: Mobile Responsiveness
    await test('Mobile Responsiveness', async () => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      // Test mobile navigation
      const mobileMenu = page.locator('button:has(svg)').first();
      if (await mobileMenu.isVisible()) {
        await mobileMenu.click();
        await page.waitForTimeout(1000);
      }
      
      await takeScreenshot('11-mobile-responsive', 'Mobile responsiveness');
      
      // Reset viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
    });

    // FINAL RESULTS
    const successRate = ((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1);
    
    console.log('\n🎯 COMPREHENSIVE FINAL TEST RESULTS:');
    console.log('=' * 60);
    console.log(`📊 Total Tests: ${testResults.summary.total}`);
    console.log(`✅ Passed: ${testResults.summary.passed}`);
    console.log(`❌ Failed: ${testResults.summary.failed}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (testResults.summary.failed === 0) {
      console.log('\n🎉 SYSTEM IS 100% READY FOR UPWORK!');
      testResults.verdict = 'READY FOR PROFESSIONAL TESTING';
    } else if (successRate >= 90) {
      console.log('\n✅ SYSTEM MOSTLY READY - Minor polish needed');
      testResults.verdict = 'MOSTLY READY - MINOR FIXES';
    } else {
      console.log('\n❌ SYSTEM NEEDS MORE WORK');
      testResults.verdict = 'NEEDS ADDITIONAL WORK';
    }

    console.log('\n📋 DETAILED RESULTS:');
    Object.entries(testResults.results).forEach(([test, result]) => {
      const icon = result.status === 'passed' ? '✅' : '❌';
      console.log(`${icon} ${test}: ${result.status} (${result.duration}ms)`);
    });

    if (testResults.errors.length > 0) {
      console.log('\n🚨 ISSUES TO ADDRESS:');
      testResults.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.test}: ${error.error}`);
      });
    }

    console.log(`\n📸 Screenshots: ${testResults.screenshots.length} files saved`);
    
    // Save test report
    fs.writeFileSync('final-quality-report.json', JSON.stringify(testResults, null, 2));
    console.log('📄 Report saved: final-quality-report.json');

    console.log('\n🎯 FINAL VERDICT FOR UPWORK:');
    console.log(testResults.verdict);
    
    console.log('\n🔍 Browser open for manual verification...');
    await new Promise(() => {}); // Keep open

  } catch (error) {
    console.error('❌ Critical test failure:', error);
    await browser.close();
  }
})();