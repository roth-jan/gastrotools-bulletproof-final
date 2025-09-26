const { chromium } = require('playwright');

const PRODUCTION_URL = 'https://gastrotools-mac-ready.vercel.app';
const DEMO_CREDENTIALS = {
  email: 'demo@gastrotools.de',
  password: 'demo123'
};

async function quickTest() {
  let browser, page;
  const results = {
    homepage: false,
    login: false,
    demoAuth: false,
    tools: {},
    issues: []
  };

  try {
    console.log('🚀 Starting quick connectivity test...');
    
    browser = await chromium.launch({ 
      headless: false,
      timeout: 30000
    });
    
    page = await browser.newPage();
    page.setDefaultTimeout(10000);
    
    // Test 1: Homepage accessibility
    console.log('Testing homepage...');
    try {
      await page.goto(PRODUCTION_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
      const title = await page.title();
      console.log(`✅ Homepage loaded: "${title}"`);
      results.homepage = true;
      
      // Take screenshot
      await page.screenshot({ path: 'homepage-test.png' });
      console.log('📸 Homepage screenshot saved');
      
    } catch (error) {
      console.log('❌ Homepage failed:', error.message);
      results.issues.push(`Homepage: ${error.message}`);
    }

    // Test 2: Login page
    console.log('Testing login page...');
    try {
      await page.goto(`${PRODUCTION_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      const loginTitle = await page.title();
      console.log(`✅ Login page loaded: "${loginTitle}"`);
      
      // Check for form elements
      const emailField = await page.$('input[type="email"], input[name="email"]');
      const passwordField = await page.$('input[type="password"]');
      const submitButton = await page.$('button[type="submit"], input[type="submit"]');
      
      if (emailField && passwordField && submitButton) {
        console.log('✅ Login form elements found');
        results.login = true;
        
        // Test demo login
        await emailField.fill(DEMO_CREDENTIALS.email);
        await passwordField.fill(DEMO_CREDENTIALS.password);
        
        console.log('Testing demo login...');
        await submitButton.click();
        await page.waitForTimeout(3000);
        
        const newUrl = page.url();
        if (!newUrl.includes('/login')) {
          console.log('✅ Demo login successful - redirected to:', newUrl);
          results.demoAuth = true;
          
          // Take post-login screenshot
          await page.screenshot({ path: 'post-login-test.png' });
          console.log('📸 Post-login screenshot saved');
          
        } else {
          console.log('❌ Demo login failed - still on login page');
          results.issues.push('Demo login failed');
        }
        
      } else {
        console.log('❌ Login form elements missing');
        results.issues.push('Login form elements not found');
      }
      
    } catch (error) {
      console.log('❌ Login test failed:', error.message);
      results.issues.push(`Login: ${error.message}`);
    }

    // Test 3: Quick tool check (if logged in)
    if (results.demoAuth) {
      const toolPaths = [
        '/naehrwertrechner',
        '/kostenkontrolle',
        '/lagerverwaltung',
        '/menueplaner',
        '/speisekarten-designer'
      ];
      
      for (const toolPath of toolPaths) {
        try {
          console.log(`Testing ${toolPath}...`);
          await page.goto(`${PRODUCTION_URL}${toolPath}`, { 
            waitUntil: 'domcontentloaded', 
            timeout: 8000 
          });
          
          const toolTitle = await page.title();
          const hasContent = await page.$('main, .container, .content, body');
          
          if (hasContent) {
            console.log(`✅ ${toolPath} loaded: "${toolTitle}"`);
            results.tools[toolPath] = true;
          } else {
            console.log(`⚠️ ${toolPath} loaded but no content found`);
            results.tools[toolPath] = false;
            results.issues.push(`${toolPath}: No main content found`);
          }
          
        } catch (error) {
          console.log(`❌ ${toolPath} failed: ${error.message}`);
          results.tools[toolPath] = false;
          results.issues.push(`${toolPath}: ${error.message}`);
        }
      }
    }

  } catch (error) {
    console.log('💥 Test setup failed:', error.message);
    results.issues.push(`Setup: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Results summary
  console.log('\n📊 QUICK TEST RESULTS:');
  console.log('========================');
  console.log('Homepage:', results.homepage ? '✅ PASS' : '❌ FAIL');
  console.log('Login Form:', results.login ? '✅ PASS' : '❌ FAIL');
  console.log('Demo Auth:', results.demoAuth ? '✅ PASS' : '❌ FAIL');
  
  const toolResults = Object.entries(results.tools);
  console.log(`Tools (${toolResults.length}):`);
  toolResults.forEach(([tool, passed]) => {
    console.log(`  ${tool}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  });
  
  if (results.issues.length > 0) {
    console.log('\n🚨 ISSUES FOUND:');
    results.issues.forEach((issue, i) => {
      console.log(`${i+1}. ${issue}`);
    });
  }

  const passCount = [
    results.homepage,
    results.login,
    results.demoAuth,
    ...Object.values(results.tools)
  ].filter(Boolean).length;
  
  const totalTests = 3 + toolResults.length;
  
  console.log(`\n🎯 OVERALL: ${passCount}/${totalTests} tests passed`);
  
  if (results.homepage && results.login && results.demoAuth) {
    console.log('🟢 BASIC FUNCTIONALITY: Working');
  } else {
    console.log('🔴 BASIC FUNCTIONALITY: Issues found');
  }
  
  return results;
}

quickTest().catch(console.error);