const { chromium } = require('playwright');

async function testLeadGateMainDomain() {
  console.log('🎯 TESTING LEAD-GATE ON UPDATED MAIN DOMAIN');
  console.log('===========================================');
  console.log('URL: https://gastrotools-bulletproof.vercel.app (FORCED TO LATEST)');
  console.log('Testing: Lead-Gate should now work!');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Clear cache completely
    await page.goto('data:text/html,<h1>Cache Clear</h1>');
    
    // Test with cache busting
    await page.goto('https://gastrotools-bulletproof.vercel.app/login?cb=' + Date.now());
    await page.fill('input[type="email"]', 'demo@gastrotools.de');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    
    // CRITICAL: Test Lead-Gate on Speisekarten-Designer
    console.log('\n📄 CRITICAL: PDF Export Lead-Gate Test');
    console.log('====================================');
    
    await page.goto('https://gastrotools-bulletproof.vercel.app/speisekarten-designer?cb=' + Date.now());
    
    // Create menu card (value creation)
    await page.fill('input[placeholder*="Summer"]', 'Lead Gate Test Card');
    await page.click('button:has-text("Create New Card")');
    await page.waitForTimeout(3000);
    
    console.log('✅ Menu card created (user value)');
    
    // Check if Export PDF button exists
    const exportBtn = page.locator('button:has-text("Export PDF")');
    const exportBtnExists = await exportBtn.count() > 0;
    
    console.log(`Export PDF button exists: ${exportBtnExists ? '✅ YES' : '❌ NO'}`);
    
    if (exportBtnExists) {
      console.log('\n🚀 Clicking Export PDF (should trigger Lead-Gate)...');
      
      // Monitor for lead gate modal
      let leadGateAppeared = false;
      let directDownload = false;
      
      // Check for modal appearance
      const checkModal = async () => {
        const modals = await page.locator('.lead-gate, [role="dialog"], .modal, .fixed').count();
        const emailInputs = await page.locator('input[type="email"]').count();
        return modals > 0 || emailInputs > 1; // More than login email
      };
      
      // Monitor downloads (old behavior)
      page.on('download', () => {
        directDownload = true;
        console.log('[OLD BEHAVIOR] Direct download detected');
      });
      
      await exportBtn.click();
      
      // Wait and check multiple times for modal
      for (let i = 0; i < 10; i++) {
        await page.waitForTimeout(500);
        leadGateAppeared = await checkModal();
        if (leadGateAppeared) {
          console.log(`✅ LEAD-GATE APPEARED after ${(i + 1) * 500}ms!`);
          break;
        }
      }
      
      if (!leadGateAppeared) {
        console.log('❌ NO LEAD-GATE: Still using old direct download behavior');
        
        // Check page source for lead gate code
        const pageSource = await page.content();
        const hasLeadGateCode = pageSource.includes('LeadGateModal') || pageSource.includes('lead-gate');
        const hasOldCode = pageSource.includes('html2canvas') || pageSource.includes('jsPDF');
        
        console.log(`Page contains LeadGateModal: ${hasLeadGateCode ? '✅' : '❌'}`);
        console.log(`Page contains old PDF code: ${hasOldCode ? '❌ OLD VERSION' : '✅ NEW VERSION'}`);
        
      } else {
        console.log('\n📧 Testing Lead-Gate Functionality');
        console.log('=================================');
        
        // Test lead form
        const emailField = page.locator('input[type="email"]').last();
        const orgSelect = page.locator('select').last();
        const submitBtn = page.locator('button:has-text("PDF per E-Mail"), button:has-text("E-Mail")');
        
        if (await emailField.count() > 0) {
          await emailField.fill('lead-test@gastrotools.de');
          console.log('✅ Email entered in lead gate');
        }
        
        if (await orgSelect.count() > 0) {
          await orgSelect.selectOption('Schule/Kita');
          console.log('✅ Segment selected: Schule/Kita (should route to WebMenü)');
        }
        
        if (await submitBtn.count() > 0) {
          await submitBtn.click();
          await page.waitForTimeout(3000);
          
          const modalClosed = await page.locator('.lead-gate, [role="dialog"]').count() === 0;
          console.log(`Lead submission successful: ${modalClosed ? '✅ Modal closed' : '❌ Still open'}`);
        }
      }
      
      console.log(`\nLEAD-GATE STATUS: ${leadGateAppeared ? '✅ WORKING' : '❌ NOT DEPLOYED'}`);
      console.log(`DOWNLOAD BEHAVIOR: ${directDownload ? '❌ OLD VERSION' : '✅ LEAD-GATED'}`);
    }
    
    // Quick test: EAR Landing Page
    console.log('\n🚚 EAR LANDING PAGE TEST');
    console.log('=======================');
    
    try {
      await page.goto('https://gastrotools-bulletproof.vercel.app/essen-auf-raedern?cb=' + Date.now());
      
      const earTitle = await page.locator('h1').first().textContent();
      const hasStarterpakete = await page.locator('text=/Starter|€99|€199|€299/i').count();
      
      console.log(`EAR Title: "${earTitle}"`);
      console.log(`Has Starterpakete: ${hasStarterpakete > 0 ? '✅ YES' : '❌ NO'}`);
      console.log(`EAR Status: ${earTitle && earTitle.includes('EAR') ? '✅ WORKING' : '❌ 404'}`);
      
    } catch (error) {
      console.log('EAR Landing: ❌ 404 ERROR');
    }
    
    await page.screenshot({ path: 'main-domain-lead-gate-test.png' });
    
    console.log('\n🎯 RECOMMENDATION:');
    console.log('==================');
    
    if (leadGateAppeared) {
      console.log('✅ Lead-Gates working - Business Case pipeline ready!');
    } else {
      console.log('🚨 Lead-Gates missing - Cache/deployment issue');
      console.log('   Try hard refresh (Ctrl+Shift+R) or test:');
      console.log('   https://gastrotools-bulletproof-dt4zzd15t-jhroth-7537s-projects.vercel.app');
    }
    
  } catch (error) {
    console.error('Lead gate test error:', error);
  } finally {
    await browser.close();
  }
}

testLeadGateMainDomain();