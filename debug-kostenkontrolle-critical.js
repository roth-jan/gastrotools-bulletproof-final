const { chromium } = require('playwright');

async function debugKostenkontrolleCritical() {
  console.log('🚨 CRITICAL BUG DEBUG: Kostenkontrolle Error Display');
  console.log('==================================================');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable all console logging
  page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));
  page.on('pageerror', error => console.log(`[ERROR] ${error.message}`));
  
  try {
    // Test both URLs
    const testUrls = [
      'https://gastrotools-bulletproof-7tqapgr1f-jhroth-7537s-projects.vercel.app',
      'https://gastrotools-bulletproof.vercel.app'
    ];
    
    let workingUrl = null;
    
    for (const url of testUrls) {
      try {
        await page.goto(`${url}/login`);
        await page.fill('input[type="email"]', 'demo@gastrotools.de');
        await page.fill('input[type="password"]', 'demo123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
        
        await page.goto(`${url}/kostenkontrolle`);
        const hasContent = await page.locator('h1').count() > 0;
        
        if (hasContent) {
          workingUrl = url;
          console.log(`✅ Testing on: ${url}`);
          break;
        }
      } catch (e) {
        console.log(`❌ ${url}: Not ready`);
      }
    }
    
    if (!workingUrl) {
      console.log('❌ No working URL found');
      return;
    }
    
    console.log('\n🧪 REPRODUCING EXACT USER SCENARIO:');
    console.log('===================================');
    console.log('Input: Positive amount + Negative price (-10€)');
    
    // Fill form exactly as user did
    const productInput = page.locator('input[placeholder*="Tomatoes"], input[placeholder*="Oil"]');
    const amountInput = page.locator('input[placeholder="1"], input[type="number"]').first();
    const priceInput = page.locator('input[placeholder="0.00"], input[step="0.01"]');
    
    console.log('\n📝 Filling form with user\'s exact scenario...');
    
    if (await productInput.count() > 0) {
      await productInput.fill('Debug Test Product');
      console.log('✅ Product filled');
    }
    
    if (await amountInput.count() > 0) {
      await amountInput.fill('5'); // Positive amount
      console.log('✅ Amount: 5 (positive)');
    }
    
    if (await priceInput.count() > 0) {
      await priceInput.fill('-10'); // Negative price (user's scenario)
      console.log('✅ Price: -10 (NEGATIVE - should trigger error)');
    }
    
    // Check if category is filled (required)
    const categorySelect = page.locator('select');
    if (await categorySelect.count() > 0) {
      await categorySelect.first().selectOption({ index: 1 });
      console.log('✅ Category selected');
    }
    
    console.log('\n🚀 Submitting form...');
    
    // Monitor what happens on form submission
    let errorElementsFound = 0;
    let consoleErrors = [];
    
    // Check for error elements BEFORE submission
    const preSubmissionErrors = await page.locator('.text-red-500, .border-red-500, .error').count();
    console.log(`Error elements before submission: ${preSubmissionErrors}`);
    
    // Submit form
    const addButton = page.locator('button:has-text("Add Entry"), button[type="submit"]');
    await addButton.click();
    await page.waitForTimeout(3000);
    
    // Check what happened AFTER submission
    const postSubmissionErrors = await page.locator('.text-red-500, .border-red-500, .error').count();
    console.log(`Error elements after submission: ${postSubmissionErrors}`);
    
    // Check if entry was added (it shouldn't be)
    const entryAdded = await page.locator('text="Debug Test Product", text="-10"').count();
    console.log(`Entry wrongly added: ${entryAdded > 0 ? '❌ YES (BUG)' : '✅ NO (correct behavior)'}`);
    
    // Check for any visual feedback
    const hasVisualFeedback = await page.locator('.bg-red, .text-red, .border-red').count();
    console.log(`Visual error feedback: ${hasVisualFeedback > 0 ? '✅ Present' : '❌ MISSING'}`);
    
    // Check browser console for validation logs
    console.log('\n🔍 DEBUGGING ERROR STATE:');
    
    // Inspect DOM for error elements
    const errorElements = await page.evaluate(() => {
      const errors = document.querySelectorAll('.text-red-500, .border-red-500, [class*="error"]');
      return Array.from(errors).map(el => ({
        tagName: el.tagName,
        className: el.className,
        textContent: el.textContent,
        visible: el.offsetWidth > 0 && el.offsetHeight > 0
      }));
    });
    
    console.log('Error elements in DOM:', errorElements);
    
    // Check if validation state exists in React
    const reactState = await page.evaluate(() => {
      // Try to access React dev tools info
      const reactRoot = document.querySelector('[data-reactroot]') || document.querySelector('#__next');
      return {
        hasReactRoot: !!reactRoot,
        totalDivs: document.querySelectorAll('div').length,
        totalInputs: document.querySelectorAll('input').length
      };
    });
    
    console.log('React state info:', reactState);
    
    // FINAL ASSESSMENT
    console.log('\n🎯 CRITICAL BUG DIAGNOSIS:');
    console.log('==========================');
    
    if (entryAdded > 0) {
      console.log('🚨 CONFIRMED BUG: Negative values accepted (should be rejected)');
    } else if (postSubmissionErrors === 0) {
      console.log('🚨 CONFIRMED BUG: No error display (user gets no feedback)');
    } else {
      console.log('✅ Validation working: Entry rejected + error shown');
    }
    
    await page.screenshot({ path: 'critical-bug-debug.png' });
    
  } catch (error) {
    console.error('Critical debug error:', error);
  } finally {
    await browser.close();
  }
}

debugKostenkontrolleCritical();