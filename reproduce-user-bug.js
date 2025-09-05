const { chromium } = require('playwright');

async function reproduceUserBug() {
  console.log('🚨 REPRODUCING EXACT USER BUG SCENARIO');
  console.log('=====================================');
  console.log('Scenario: Negative Unit Price (-10€) + Positive Amount');
  console.log('Expected: Error message + Entry not saved');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Log all browser activity
  page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));
  page.on('pageerror', error => console.log(`[ERROR] ${error.message}`));
  
  try {
    // Go to main bulletproof URL (latest production)
    console.log('\n1. 🔐 Login to latest production...');
    await page.goto('https://gastrotools-bulletproof.vercel.app/login');
    
    await page.fill('input[type="email"]', 'demo@gastrotools.de');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    
    console.log('✅ Logged in successfully');
    
    // Navigate to Kostenkontrolle
    console.log('\n2. 📊 Navigate to Kostenkontrolle...');
    await page.goto('https://gastrotools-bulletproof.vercel.app/kostenkontrolle');
    
    const title = await page.locator('h1').textContent();
    console.log(`✅ Page loaded: ${title}`);
    
    // EXACT USER SCENARIO: Fill form with negative price
    console.log('\n3. 📝 Fill form with EXACT user inputs...');
    
    // Step by step - exactly as user did
    const productInput = page.locator('input[placeholder*="Tomatoes"], input[placeholder*="Oil"]').first();
    await productInput.fill('User Bug Test Item');
    console.log('✅ Product: "User Bug Test Item"');
    
    // Select category (user might have done this)
    const categorySelect = page.locator('button:has-text("Select category")');
    if (await categorySelect.count() > 0) {
      await categorySelect.click();
      await page.waitForTimeout(500);
      
      const vegetables = page.locator('text="Vegetables"');
      if (await vegetables.count() > 0) {
        await vegetables.click();
        console.log('✅ Category: Vegetables');
      }
    }
    
    // Amount (positive)
    const amountInput = page.locator('input[placeholder="1"]');
    await amountInput.fill('5');
    console.log('✅ Amount: 5 (positive)');
    
    // Unit Price (NEGATIVE - this should trigger error)
    const priceInput = page.locator('input[placeholder="0.00"]');
    await priceInput.fill('-10');
    console.log('🚨 Unit Price: -10 (NEGATIVE - should cause error)');
    
    // Supplier
    const supplierInput = page.locator('input[placeholder*="Supplier"]');
    await supplierInput.fill('Test Supplier');
    console.log('✅ Supplier: Test Supplier');
    
    console.log('\n4. 🧪 Check form state before submission...');
    
    // Check if any errors are already visible
    const preErrors = await page.locator('.text-red-500, .border-red-500').count();
    console.log(`Pre-submission errors visible: ${preErrors}`);
    
    // Check field values
    const currentValues = await page.evaluate(() => {
      return {
        product: document.querySelector('input[placeholder*="Tomatoes"]')?.value,
        amount: document.querySelector('input[placeholder="1"]')?.value,
        price: document.querySelector('input[placeholder="0.00"]')?.value,
        supplier: document.querySelector('input[placeholder*="Supplier"]')?.value
      };
    });
    console.log('Current form values:', currentValues);
    
    console.log('\n5. 🚀 SUBMIT FORM (critical moment)...');
    
    const addButton = page.locator('button:has-text("Add Entry")');
    await addButton.click();
    
    // Wait and monitor what happens
    await page.waitForTimeout(5000);
    
    console.log('\n6. 🔍 ANALYZE RESULTS...');
    
    // Check for error messages
    const postErrors = await page.locator('.text-red-500, .border-red-500').count();
    console.log(`Post-submission errors visible: ${postErrors}`);
    
    // Get specific error texts
    const errorTexts = await page.locator('.text-red-500').allTextContents();
    console.log('Error messages:', errorTexts);
    
    // Check if entry was wrongly added
    const entryAdded = await page.locator('text="User Bug Test Item", text="-10"').count();
    console.log(`Entry wrongly added: ${entryAdded > 0 ? '🚨 BUG CONFIRMED' : '✅ CORRECTLY REJECTED'}`);
    
    // Check if form was cleared (it shouldn't be if there are errors)
    const formCleared = await page.locator('input[placeholder="0.00"]').inputValue();
    console.log(`Form state after submit: ${formCleared === '' ? 'Cleared (wrong)' : `Value: ${formCleared}`}`);
    
    console.log('\n🎯 FINAL DIAGNOSIS:');
    console.log('==================');
    
    if (entryAdded > 0) {
      console.log('🚨 CONFIRMED BUG: Negative price entry was saved (CRITICAL)');
    } else if (postErrors === 0) {
      console.log('🚨 CONFIRMED BUG: No error feedback shown (UX CRITICAL)');
    } else {
      console.log('✅ VALIDATION WORKING: Error shown + entry rejected');
      console.log('   User might have tested old cached version');
    }
    
    await page.screenshot({ path: 'user-bug-reproduction.png' });
    
  } catch (error) {
    console.error('User bug reproduction error:', error);
  } finally {
    await browser.close();
  }
}

reproduceUserBug();