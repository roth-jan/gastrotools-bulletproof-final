const { chromium } = require('playwright');

const PRODUCTION_URL = 'https://gastrotools-mac-ready.vercel.app';
const DEMO_CREDENTIALS = { email: 'demo@gastrotools.de', password: 'demo123' };

async function detailedVerificationTest() {
  let browser, page;
  const findings = {
    english_mode: { status: 'unknown', details: [] },
    nutrition_search: { status: 'unknown', details: [] },
    form_validation: { status: 'unknown', details: [] },
    dashboard_security: { status: 'unknown', details: [] },
    admin_access: { status: 'unknown', details: [] },
    error_messages: { status: 'unknown', details: [] }
  };

  try {
    console.log('🔍 DETAILED VERIFICATION TESTING');
    console.log('=================================\n');

    browser = await chromium.launch({ headless: false, slowMo: 100 });
    page = await browser.newPage();
    page.setDefaultTimeout(8000);

    // TEST 1: English Mode Verification
    console.log('1. 🌍 TESTING ENGLISH MODE FUNCTIONALITY');
    console.log('----------------------------------------');

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('domcontentloaded');

    // Look for language switcher
    const langButtons = await page.$$('button, select, a');
    let englishSwitcher = null;

    for (const button of langButtons) {
      const text = await button.textContent();
      if (text && (text.includes('EN') || text.includes('English'))) {
        englishSwitcher = button;
        break;
      }
    }

    if (englishSwitcher) {
      console.log('✅ Language switcher found');
      
      // Click to switch to English
      await englishSwitcher.click();
      await page.waitForTimeout(2000);
      
      // Check if page content changed
      const bodyText = await page.textContent('body');
      const germanWords = [
        'Anmelden', 'Registrieren', 'Kostenlos', 'Nährwerte', 
        'Kostenkontrolle', 'Lagerverwaltung', 'Menüplaner', 
        'Speisekarten', 'Erstellen'
      ];
      
      const foundGermanWords = germanWords.filter(word => 
        bodyText.toLowerCase().includes(word.toLowerCase())
      );
      
      if (foundGermanWords.length === 0) {
        findings.english_mode.status = 'working';
        findings.english_mode.details.push('✅ No German text found in English mode');
        console.log('✅ English mode working correctly');
      } else {
        findings.english_mode.status = 'partial';
        findings.english_mode.details.push(`⚠️ Still found German words: ${foundGermanWords.join(', ')}`);
        console.log(`⚠️ English mode partial - still has German words: ${foundGermanWords.join(', ')}`);
      }
      
      // Take screenshot
      await page.screenshot({ path: './english-mode-verification.png', fullPage: true });
      console.log('📸 English mode screenshot saved');
      
    } else {
      findings.english_mode.status = 'not_found';
      findings.english_mode.details.push('❌ No English language switcher found');
      console.log('❌ No language switcher found');
    }

    // TEST 2: Nutrition Search Deep Test
    console.log('\n2. 🔍 TESTING NUTRITION SEARCH IN DETAIL');
    console.log('------------------------------------------');

    // Login first
    await page.goto(`${PRODUCTION_URL}/login`);
    await page.fill('input[type="email"]', DEMO_CREDENTIALS.email);
    await page.fill('input[type="password"]', DEMO_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    await page.goto(`${PRODUCTION_URL}/naehrwertrechner`);
    await page.waitForLoadState('domcontentloaded');

    // Look for search input
    const searchInputs = await page.$$('input[type="text"], input[placeholder*="Zutat"], input[placeholder*="ingredient"]');
    
    if (searchInputs.length > 0) {
      const searchInput = searchInputs[0];
      console.log('✅ Search input found');
      
      // Test different search terms
      const searchTerms = ['Tomato', 'Hackfleisch', 'Kartoffel', 'Milch'];
      
      for (const term of searchTerms) {
        console.log(`   Testing search for: ${term}`);
        
        await searchInput.fill('');
        await page.waitForTimeout(500);
        await searchInput.fill(term);
        await page.waitForTimeout(2000);
        
        // Check for search results
        const resultSelectors = [
          '.search-results', '.dropdown', '.autocomplete', '.results',
          'ul li', '.suggestion', '.option'
        ];
        
        let hasResults = false;
        for (const selector of resultSelectors) {
          const results = await page.$$(selector);
          if (results.length > 0) {
            const isVisible = await results[0].isVisible();
            if (isVisible) {
              hasResults = true;
              break;
            }
          }
        }
        
        if (hasResults) {
          findings.nutrition_search.details.push(`✅ Search results found for: ${term}`);
          console.log(`   ✅ Results found for ${term}`);
        } else {
          findings.nutrition_search.details.push(`❌ No results for: ${term}`);
          console.log(`   ❌ No results for ${term}`);
        }
      }
      
      const successfulSearches = findings.nutrition_search.details.filter(d => d.includes('✅')).length;
      
      if (successfulSearches >= 3) {
        findings.nutrition_search.status = 'working';
      } else if (successfulSearches >= 1) {
        findings.nutrition_search.status = 'partial';
      } else {
        findings.nutrition_search.status = 'not_working';
      }
      
    } else {
      findings.nutrition_search.status = 'no_input';
      findings.nutrition_search.details.push('❌ No search input field found');
      console.log('❌ No search input field found');
    }

    await page.screenshot({ path: './nutrition-search-test.png', fullPage: true });
    console.log('📸 Nutrition search screenshot saved');

    // TEST 3: Form Validation Deep Test
    console.log('\n3. ✅ TESTING FORM VALIDATION IN DETAIL');
    console.log('---------------------------------------');

    await page.goto(`${PRODUCTION_URL}/register`);
    await page.waitForLoadState('domcontentloaded');

    const forms = await page.$$('form');
    if (forms.length > 0) {
      console.log('✅ Registration form found');
      
      const submitButton = await page.$('button[type="submit"], input[type="submit"]');
      if (submitButton) {
        // Test 1: Empty form submission
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        const errorElements = await page.$$('.error, .alert, .text-red, [class*="error"], .invalid-feedback');
        if (errorElements.length > 0) {
          findings.form_validation.details.push('✅ Error messages appear for empty form');
          console.log('✅ Error messages shown for empty form');
        } else {
          findings.form_validation.details.push('❌ No error messages for empty form');
          console.log('❌ No error messages for empty form');
        }
        
        // Test 2: Invalid email
        const emailInput = await page.$('input[type="email"]');
        if (emailInput) {
          await emailInput.fill('invalid-email-format');
          await submitButton.click();
          await page.waitForTimeout(1000);
          
          const emailErrors = await page.$$('.error, .alert, [class*="error"]');
          if (emailErrors.length > 0) {
            findings.form_validation.details.push('✅ Email validation working');
            console.log('✅ Email validation working');
          } else {
            findings.form_validation.details.push('❌ Email validation not working');
            console.log('❌ Email validation not working');
          }
        }
        
        const workingValidations = findings.form_validation.details.filter(d => d.includes('✅')).length;
        findings.form_validation.status = workingValidations >= 1 ? 'working' : 'not_working';
        
      } else {
        findings.form_validation.status = 'no_submit_button';
        findings.form_validation.details.push('❌ No submit button found');
      }
    } else {
      findings.form_validation.status = 'no_form';
      findings.form_validation.details.push('❌ No registration form found');
    }

    // TEST 4: Dashboard Security Deep Test
    console.log('\n4. 🔒 TESTING DASHBOARD SECURITY IN DETAIL');
    console.log('------------------------------------------');

    // Clear session
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Try to access dashboard without login
    await page.goto(`${PRODUCTION_URL}/dashboard`);
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`Current URL after accessing dashboard: ${currentUrl}`);
    
    if (currentUrl.includes('/login') || currentUrl.includes('/auth')) {
      findings.dashboard_security.status = 'protected';
      findings.dashboard_security.details.push('✅ Dashboard properly redirected to login');
      console.log('✅ Dashboard is properly protected - redirected to login');
    } else {
      findings.dashboard_security.status = 'not_protected';
      findings.dashboard_security.details.push('❌ Dashboard accessible without authentication');
      console.log('❌ Dashboard is NOT protected - accessible without login');
    }

    // TEST 5: Admin Access Deep Test
    console.log('\n5. 👨‍💼 TESTING ADMIN ACCESS IN DETAIL');
    console.log('------------------------------------');

    // Login as demo user
    await page.goto(`${PRODUCTION_URL}/login`);
    await page.fill('input[type="email"]', DEMO_CREDENTIALS.email);
    await page.fill('input[type="password"]', DEMO_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Try admin access
    await page.goto(`${PRODUCTION_URL}/admin`);
    await page.waitForTimeout(3000);
    
    const adminUrl = page.url();
    console.log(`Admin URL: ${adminUrl}`);
    
    if (adminUrl.includes('/admin')) {
      findings.admin_access.status = 'accessible';
      findings.admin_access.details.push('✅ Admin panel accessible for demo user');
      console.log('✅ Admin panel accessible');
      
      // Check for admin content
      const adminElements = await page.$$('h1, h2, .admin, .dashboard, .monitoring');
      if (adminElements.length > 0) {
        findings.admin_access.details.push('✅ Admin content present');
        console.log('✅ Admin content found');
      }
    } else {
      findings.admin_access.status = 'not_accessible';
      findings.admin_access.details.push('❌ Admin panel not accessible');
      console.log('❌ Admin panel not accessible');
    }

    // TEST 6: Error Messages Deep Test
    console.log('\n6. 🚨 TESTING ERROR MESSAGES IN DETAIL');
    console.log('--------------------------------------');

    await page.goto(`${PRODUCTION_URL}/login`);
    await page.waitForLoadState('domcontentloaded');

    // Test with completely wrong credentials
    await page.fill('input[type="email"]', 'nonexistent@user.com');
    await page.fill('input[type="password"]', 'completelywrongpassword123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Look for error messages
    const errorSelectors = [
      '.error', '.alert', '.text-red', '.text-danger', 
      '.alert-error', '.toast', '.message', '[class*="error"]'
    ];
    
    let errorFound = false;
    for (const selector of errorSelectors) {
      const errorElements = await page.$$(selector);
      for (const element of errorElements) {
        const isVisible = await element.isVisible();
        if (isVisible) {
          const text = await element.textContent();
          if (text && text.trim().length > 0) {
            findings.error_messages.details.push(`✅ Error message found: "${text.trim()}"`);
            console.log(`✅ Error message: "${text.trim()}"`);
            errorFound = true;
            break;
          }
        }
      }
      if (errorFound) break;
    }

    if (errorFound) {
      findings.error_messages.status = 'working';
    } else {
      findings.error_messages.status = 'not_working';
      findings.error_messages.details.push('❌ No error message shown for invalid credentials');
      console.log('❌ No error message shown for invalid credentials');
    }

    await page.screenshot({ path: './error-messages-test.png', fullPage: true });
    console.log('📸 Error messages screenshot saved');

  } catch (error) {
    console.error('Test execution error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // GENERATE DETAILED REPORT
  console.log('\n📊 DETAILED VERIFICATION RESULTS');
  console.log('==================================');

  const categories = [
    { key: 'english_mode', name: 'English Mode', critical: true },
    { key: 'nutrition_search', name: 'Nutrition Search', critical: true },
    { key: 'form_validation', name: 'Form Validation', critical: false },
    { key: 'dashboard_security', name: 'Dashboard Security', critical: true },
    { key: 'admin_access', name: 'Admin Access', critical: false },
    { key: 'error_messages', name: 'Error Messages', critical: false }
  ];

  let criticalIssues = 0;
  let totalIssues = 0;

  categories.forEach(category => {
    const finding = findings[category.key];
    const statusIcon = finding.status === 'working' ? '✅' : 
                      finding.status === 'partial' ? '⚠️' : 
                      finding.status === 'accessible' ? '✅' :
                      finding.status === 'protected' ? '✅' : '❌';
    
    console.log(`\n${statusIcon} ${category.name.toUpperCase()}: ${finding.status.toUpperCase()}`);
    finding.details.forEach(detail => console.log(`   ${detail}`));
    
    if (finding.status !== 'working' && finding.status !== 'accessible' && finding.status !== 'protected') {
      totalIssues++;
      if (category.critical) {
        criticalIssues++;
      }
    }
  });

  console.log('\n🎯 FINAL ASSESSMENT');
  console.log('===================');
  console.log(`Critical Issues: ${criticalIssues}`);
  console.log(`Total Issues: ${totalIssues}`);

  let readinessStatus;
  if (criticalIssues === 0 && totalIssues <= 1) {
    readinessStatus = '✅ READY for Upwork';
  } else if (criticalIssues <= 1 && totalIssues <= 3) {
    readinessStatus = '⚠️ CONDITIONALLY READY';
  } else {
    readinessStatus = '❌ NOT READY';
  }

  console.log(`\n🏆 UPWORK READINESS: ${readinessStatus}`);

  if (criticalIssues > 0) {
    console.log('\n🚨 CRITICAL ISSUES TO FIX BEFORE UPWORK:');
    categories.forEach(category => {
      if (category.critical) {
        const finding = findings[category.key];
        if (finding.status !== 'working' && finding.status !== 'accessible' && finding.status !== 'protected') {
          console.log(`- ${category.name}: ${finding.status}`);
        }
      }
    });
  }

  console.log('\n📁 Screenshots saved:');
  console.log('- english-mode-verification.png');
  console.log('- nutrition-search-test.png');
  console.log('- error-messages-test.png');

  return findings;
}

detailedVerificationTest().catch(console.error);