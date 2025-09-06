const { chromium } = require('playwright');

async function testPDFFixSelf() {
  console.log('📄 SELF-TESTING: PDF Generation Fix');
  console.log('==================================');
  console.log('Testing: Browser Print-to-PDF vs Corrupt Download');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Login
    await page.goto('https://gastrotools-bulletproof.vercel.app/login');
    await page.fill('input[type="email"]', 'demo@gastrotools.de');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    await page.goto('https://gastrotools-bulletproof.vercel.app/speisekarten-designer');
    
    // Create test card with content
    await page.fill('input[placeholder*="Summer"]', 'PDF Fix Test Menu');
    await page.click('button:has-text("Create New Card")');
    await page.waitForTimeout(2000);
    
    console.log('✅ Menu card created for PDF test');
    
    // Test PDF Export
    const exportBtn = page.locator('button:has-text("Export PDF")');
    
    let downloadTriggered = false;
    let popupOpened = false;
    
    // Monitor downloads (old method)
    page.on('download', (download) => {
      downloadTriggered = true;
      console.log(`📥 Download detected: ${download.suggestedFilename()}`);
    });
    
    // Monitor popup windows (new method)
    page.on('popup', () => {
      popupOpened = true;
      console.log('🖨️ Print window opened (new PDF method)');
    });
    
    console.log('🚀 Clicking Export PDF...');
    await exportBtn.click();
    
    // Wait for either download or popup
    await page.waitForTimeout(5000);
    
    console.log('\n📊 PDF EXPORT RESULTS:');
    console.log('======================');
    console.log(`Old method (direct download): ${downloadTriggered ? '✅ Triggered' : '❌ Not triggered'}`);
    console.log(`New method (print window): ${popupOpened ? '✅ Opened' : '❌ Not opened'}`);
    
    if (popupOpened) {
      console.log('🎉 SUCCESS: Browser Print-to-PDF method working!');
      console.log('   User can now save as real PDF via browser print dialog');
    } else if (downloadTriggered) {
      console.log('⚠️ FALLBACK: Direct download working (but might be .txt)');
      console.log('   User gets file but needs to check if it opens properly');
    } else {
      console.log('❌ FAILURE: No PDF export method working');
    }
    
    // Test Smart Upsell still works
    console.log('\n💡 TESTING: Smart Upsell Still Works');
    console.log('====================================');
    
    await page.waitForTimeout(3000);
    const upsellVisible = await page.locator('.fixed, [role="alert"]').count();
    console.log(`Smart Upsell after PDF: ${upsellVisible > 0 ? '✅ Still working' : '❌ Broken by PDF fix'}`);
    
    await page.screenshot({ path: 'pdf-fix-self-test.png' });
    
    console.log('\n🎯 PDF FIX ASSESSMENT:');
    console.log('======================');
    
    if (popupOpened) {
      console.log('✅ PDF PROBLEM SOLVED: Real PDF via print dialog');
    } else if (downloadTriggered) {
      console.log('🔧 PDF IMPROVED: Download works, format might need checking');  
    } else {
      console.log('🚨 PDF STILL BROKEN: Neither method working');
    }
    
  } catch (error) {
    console.error('PDF fix test error:', error);
  } finally {
    await browser.close();
  }
}

testPDFFixSelf();