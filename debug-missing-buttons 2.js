const { chromium } = require('playwright');

async function debugMissingButtons() {
  console.log('🔍 DEBUGGING MISSING PDF + PREVIEW BUTTONS');
  console.log('==========================================');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://gastrotools-bulletproof-8cx1sdikb-jhroth-7537s-projects.vercel.app/login');
    await page.fill('input[type="email"]', 'demo@gastrotools.de');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    await page.goto('https://gastrotools-bulletproof-8cx1sdikb-jhroth-7537s-projects.vercel.app/speisekarten-designer');
    
    // ANALYSIS: Check page source for my button code
    console.log('\n1. 📄 Page Source Analysis');
    console.log('=========================');
    
    const pageSource = await page.content();
    
    const hasExportPDFText = pageSource.includes('Export PDF');
    const hasPreviewText = pageSource.includes('Preview');
    const hasMyPDFCode = pageSource.includes('html2canvas') || pageSource.includes('jsPDF');
    const hasMyPreviewCode = pageSource.includes('window.open') || pageSource.includes('previewWindow');
    const hasOldAlertCode = pageSource.includes('PDF Export functionality - Menu card PDF would download');
    
    console.log(`Contains "Export PDF" text: ${hasExportPDFText ? '✅' : '❌'}`);
    console.log(`Contains "Preview" text: ${hasPreviewText ? '✅' : '❌'}`);  
    console.log(`Contains my PDF code (html2canvas): ${hasMyPDFCode ? '✅' : '❌'}`);
    console.log(`Contains my Preview code (window.open): ${hasMyPreviewCode ? '✅' : '❌'}`);
    console.log(`Contains OLD alert code: ${hasOldAlertCode ? '❌ OLD VERSION' : '✅ NEW VERSION'}`);
    
    // ANALYSIS: Check component structure
    console.log('\n2. 🔍 Component Structure Analysis');
    console.log('==================================');
    
    // Create menu card to see if buttons appear
    await page.fill('input[placeholder*="Summer"]', 'Button Debug Test');
    await page.click('button:has-text("Create New Card")');
    await page.waitForTimeout(2000);
    
    // Get all buttons to see what's available
    const allButtons = await page.locator('button').allTextContents();
    const relevantButtons = allButtons.filter(text => 
      text && !text.includes('EN') && !text.includes('Abmelden') && text.length < 50
    );
    
    console.log('All available buttons after card creation:');
    relevantButtons.forEach((btn, i) => console.log(`   ${i+1}. "${btn}"`));
    
    // Check for conditional rendering clues
    const hasCategories = await page.locator('text="Categories", .category').count();
    const hasItems = await page.locator('text="Items", .item').count();
    const hasCardSelected = await page.locator('text="Button Debug Test"').count();
    
    console.log(`\nCard created successfully: ${hasCardSelected > 0 ? '✅' : '❌'}`);
    console.log(`Has categories section: ${hasCategories > 0 ? '✅' : '❌'}`);
    console.log(`Has items section: ${hasItems > 0 ? '✅' : '❌'}`);
    
    // Try adding content to see if buttons appear
    console.log('\n3. 🧪 Testing Button Appearance After Content');
    console.log('============================================');
    
    // Look for add category interface
    const categoryInput = page.locator('input[placeholder*="category"]');
    const itemInput = page.locator('input[placeholder*="item"]');
    
    if (await categoryInput.count() > 0) {
      await categoryInput.fill('Test Category');
      
      const addCategoryBtn = page.locator('button:has-text("Add"), button[type="submit"]');
      if (await addCategoryBtn.count() > 0) {
        await addCategoryBtn.first().click();
        await page.waitForTimeout(2000);
        
        console.log('✅ Added test category');
        
        // Check if export/preview buttons appear now
        const exportAfterCategory = await page.locator('button:has-text("Export PDF")').count();
        const previewAfterCategory = await page.locator('button:has-text("Preview")').count();
        
        console.log(`Export button after category: ${exportAfterCategory > 0 ? '✅ APPEARED' : '❌ STILL MISSING'}`);
        console.log(`Preview button after category: ${previewAfterCategory > 0 ? '✅ APPEARED' : '❌ STILL MISSING'}`);
        
        // Try adding an item too
        if (await itemInput.count() > 0) {
          await itemInput.fill('Test Item');
          await page.fill('input[type="number"]', '12.50'); // Price
          
          const addItemBtn = page.locator('button:has-text("Add Item")');
          if (await addItemBtn.count() > 0) {
            await addItemBtn.click();
            await page.waitForTimeout(2000);
            
            console.log('✅ Added test item');
            
            const exportAfterItem = await page.locator('button:has-text("Export PDF")').count();
            const previewAfterItem = await page.locator('button:has-text("Preview")').count();
            
            console.log(`Export button after item: ${exportAfterItem > 0 ? '✅ APPEARED' : '❌ STILL MISSING'}`);
            console.log(`Preview button after item: ${previewAfterItem > 0 ? '✅ APPEARED' : '❌ STILL MISSING'}`);
          }
        }
      }
    }
    
    console.log('\n🎯 DIAGNOSIS CONCLUSION');
    console.log('======================');
    
    if (hasMyPDFCode && hasMyPreviewCode) {
      console.log('✅ MY CODE IS DEPLOYED: Buttons should be functional');
    } else if (hasOldAlertCode) {
      console.log('❌ OLD CODE STILL DEPLOYED: Fixes did not make it through');
    } else {
      console.log('🤔 MIXED STATE: Partial deployment or conditional rendering');
    }
    
  } catch (error) {
    console.error('Button debug error:', error);
  } finally {
    await browser.close();
  }
}

debugMissingButtons();