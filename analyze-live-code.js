const { chromium } = require('playwright');

async function analyzeLiveCode() {
  console.log('🔍 ANALYZING LIVE CODE VS SOURCE CODE');
  console.log('====================================');
  console.log('ID: 6spU1AQjT (https://gastrotools-bulletproof-7tqapgr1f-jhroth-7537s-projects.vercel.app)');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Login
    await page.goto('https://gastrotools-bulletproof-7tqapgr1f-jhroth-7537s-projects.vercel.app/login');
    await page.fill('input[type="email"]', 'demo@gastrotools.de');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // ANALYSIS 1: Check if PDF Export code is in the page source
    console.log('\n1. 📄 PDF Export Code Analysis');
    console.log('==============================');
    
    await page.goto('https://gastrotools-bulletproof-7tqapgr1f-jhroth-7537s-projects.vercel.app/speisekarten-designer');
    
    // Check page source for my PDF export code
    const pageSource = await page.content();
    
    const hasHTML2Canvas = pageSource.includes('html2canvas');
    const hasJSPDF = pageSource.includes('jsPDF');
    const hasMyPDFCode = pageSource.includes('Professional PDF Export') || pageSource.includes('html2canvas + jsPDF');
    const hasOldAlertCode = pageSource.includes('PDF Export functionality - Menu card PDF would download');
    
    console.log(`Page contains html2canvas: ${hasHTML2Canvas ? '✅' : '❌'}`);
    console.log(`Page contains jsPDF: ${hasJSPDF ? '✅' : '❌'}`);
    console.log(`Page contains my PDF code: ${hasMyPDFCode ? '✅' : '❌'}`);
    console.log(`Page contains old alert code: ${hasOldAlertCode ? '❌ OLD VERSION' : '✅ NEW VERSION'}`);
    
    // ANALYSIS 2: Check actual button behavior
    console.log('\n2. 🧪 Live Button Behavior Analysis');
    console.log('===================================');
    
    // Create a test menu card
    await page.fill('input[placeholder*="Summer"]', 'Code Analysis Test');
    await page.click('button:has-text("Create New Card")');
    await page.waitForTimeout(2000);
    
    // Check if Export/Preview buttons exist
    const exportBtn = page.locator('button:has-text("Export PDF")');
    const previewBtn = page.locator('button:has-text("Preview")');
    
    const exportExists = await exportBtn.count() > 0;
    const previewExists = await previewBtn.count() > 0;
    
    console.log(`Export PDF button exists: ${exportExists ? '✅' : '❌'}`);
    console.log(`Preview button exists: ${previewExists ? '✅' : '❌'}`);
    
    // Check button JavaScript by inspecting onclick handlers
    if (exportExists) {
      const exportHandler = await exportBtn.evaluate(el => {
        const hasOnClick = !!el.onclick;
        const handlerString = el.onclick ? el.onclick.toString().substring(0, 100) : 'none';
        return { hasOnClick, handlerPreview: handlerString };
      });
      
      console.log(`Export button has handler: ${exportHandler.hasOnClick ? '✅' : '❌'}`);
      console.log(`Handler preview: ${exportHandler.handlerPreview}`);
    }
    
    if (previewExists) {
      const previewHandler = await previewBtn.evaluate(el => {
        const hasOnClick = !!el.onclick;  
        const handlerString = el.onclick ? el.onclick.toString().substring(0, 100) : 'none';
        return { hasOnClick, handlerPreview: handlerString };
      });
      
      console.log(`Preview button has handler: ${previewHandler.hasOnClick ? '✅' : '❌'}`);
      console.log(`Handler preview: ${previewHandler.handlerPreview}`);
    }
    
    // ANALYSIS 3: Check if buttons are conditional (need categories/items)
    console.log('\n3. 🔍 Button Visibility Conditions');
    console.log('==================================');
    
    // Check if buttons appear after adding categories/items
    const hasCategories = await page.locator('text="Categories", .categories').count();
    const hasItems = await page.locator('text="Items", .items, .menu-item').count();
    
    console.log(`Menu has categories: ${hasCategories > 0 ? '✅' : '❌'}`);
    console.log(`Menu has items: ${hasItems > 0 ? '✅' : '❌'}`);
    
    // Try to add category/item to trigger button visibility
    console.log('\n4. 🧪 Testing Button Visibility After Content');
    console.log('============================================');
    
    // Look for add category/item interface
    const addCategoryInput = page.locator('input[placeholder*="category"], input[placeholder*="Category"]');
    const addItemInput = page.locator('input[placeholder*="item"], input[placeholder*="Item"]');
    
    if (await addCategoryInput.count() > 0) {
      console.log('Found category input - adding test category...');
      await addCategoryInput.fill('Test Category');
      
      const addCategoryBtn = page.locator('button:has-text("Add Category"), button[type="submit"]');
      if (await addCategoryBtn.count() > 0) {
        await addCategoryBtn.click();
        await page.waitForTimeout(2000);
        
        // Check if buttons appear after adding content
        const exportAfterContent = await page.locator('button:has-text("Export PDF")').count();
        const previewAfterContent = await page.locator('button:has-text("Preview")').count();
        
        console.log(`Export button after content: ${exportAfterContent > 0 ? '✅ APPEARS' : '❌ STILL MISSING'}`);
        console.log(`Preview button after content: ${previewAfterContent > 0 ? '✅ APPEARS' : '❌ STILL MISSING'}`);
      }
    }
    
    // FINAL DIAGNOSIS
    console.log('\n🎯 DEPLOYMENT DIAGNOSIS');
    console.log('=======================');
    
    if (hasMyPDFCode && !exportExists) {
      console.log('🤔 THEORY: Code deployed but buttons are conditional');
    } else if (hasOldAlertCode && !hasMyPDFCode) {
      console.log('🚨 CONFIRMED: Old version deployed, new code missing');
    } else if (!hasMyPDFCode && !hasOldAlertCode) {
      console.log('🤔 THEORY: Build excluded PDF files or partial compilation');
    } else {
      console.log('🔍 UNKNOWN: Mixed deployment state needs investigation');
    }
    
    await page.screenshot({ path: 'deployment-analysis.png' });
    
  } catch (error) {
    console.error('Live code analysis error:', error);
  } finally {
    await browser.close();
  }
}

analyzeLiveCode();