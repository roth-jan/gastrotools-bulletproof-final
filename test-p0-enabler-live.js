const { chromium } = require('playwright');

async function testP0EnablerLive() {
  console.log('🧪 TESTING P0 TESTBARE ENABLER - LIVE VERIFICATION');
  console.log('==================================================');
  console.log('URL: https://gastrotools-bulletproof.vercel.app');
  console.log('Testing: All P0 E2E-Ready components');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  let p0Results = {
    realPDFExport: false,
    magicLinkAPI: false,
    oauthStub: false,
    eventViewer: false,
    stableSelectors: false
  };
  
  try {
    // P0 TEST 1: Real PDF Export with proper headers
    console.log('\n📄 P0.1: ECHTER PDF-EXPORT TEST');
    console.log('==============================');
    
    await page.goto('https://gastrotools-bulletproof.vercel.app/login');
    await page.fill('input[type="email"]', 'demo@gastrotools.de');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    
    await page.goto('https://gastrotools-bulletproof.vercel.app/speisekarten-designer');
    
    // Create test menu card
    await page.fill('input[placeholder*="Summer"]', 'P0 PDF Test Card');
    await page.click('button:has-text("Create New Card")');
    await page.waitForTimeout(3000);
    
    // Test stable selector
    const exportBtn = page.locator('[data-testid="export-pdf-btn"]');
    const selectorWorking = await exportBtn.count() > 0;
    p0Results.stableSelectors = selectorWorking;
    
    console.log(`Stable selector [data-testid="export-pdf-btn"]: ${selectorWorking ? '✅' : '❌'}`);
    
    if (selectorWorking) {
      let downloadTriggered = false;
      let properHeaders = false;
      
      // Monitor network for proper PDF response
      page.on('response', response => {
        if (response.url().includes('/api/export/pdf')) {
          const contentType = response.headers()['content-type'];
          const contentDisposition = response.headers()['content-disposition'];
          
          properHeaders = contentType === 'application/pdf' && 
                         contentDisposition?.includes('attachment');
          
          console.log(`PDF API Response: ${response.status()}`);
          console.log(`Content-Type: ${contentType}`);
          console.log(`Content-Disposition: ${contentDisposition}`);
        }
      });
      
      // Monitor downloads
      page.on('download', (download) => {
        downloadTriggered = true;
        const filename = download.suggestedFilename();
        console.log(`Download triggered: ${filename}`);
        
        // Check filename format: MENU_<slug>_<ts>.pdf
        const isProperFormat = filename.startsWith('MENU_') && filename.endsWith('.pdf');
        console.log(`Proper filename format: ${isProperFormat ? '✅' : '❌'}`);
      });
      
      await exportBtn.click();
      await page.waitForTimeout(5000);
      
      p0Results.realPDFExport = downloadTriggered && properHeaders;
      
      console.log(`Real PDF Export: ${p0Results.realPDFExport ? '✅ WORKING' : '❌ FAILED'}`);
      console.log(`Download triggered: ${downloadTriggered ? '✅' : '❌'}`);
      console.log(`Proper headers: ${properHeaders ? '✅' : '❌'}`);
    }
    
    // P0 TEST 2: Magic-Link API for staging
    console.log('\n📧 P0.2: MAGIC-LINK-NACHWEIS API');
    console.log('===============================');
    
    try {
      const magicResponse = await page.evaluate(async () => {
        const response = await fetch('/api/test/magic-links');
        return { status: response.status, data: await response.json() };
      });
      
      p0Results.magicLinkAPI = magicResponse.status === 200 && magicResponse.data.success;
      
      console.log(`Magic-Link API: ${p0Results.magicLinkAPI ? '✅' : '❌'}`);
      console.log(`Response: ${magicResponse.status} - ${magicResponse.data.magicLinks?.length || 0} links`);
      
    } catch (error) {
      console.log('Magic-Link API: ❌ ERROR');
    }
    
    // P0 TEST 3: OAuth Stub Interface
    console.log('\n🔐 P0.3: OAUTH-STUB INTERFACE');
    console.log('============================');
    
    try {
      await page.goto('https://gastrotools-bulletproof.vercel.app/api/auth/oauth-stub?provider=google&email=test@example.com');
      
      const isStubPage = await page.locator('text="OAuth-Stub aktiv"').count() > 0;
      const hasApprove = await page.locator('button:has-text("Autorisieren")').count() > 0;
      const hasDeny = await page.locator('button:has-text("Ablehnen")').count() > 0;
      
      p0Results.oauthStub = isStubPage && hasApprove && hasDeny;
      
      console.log(`OAuth Stub Page: ${isStubPage ? '✅' : '❌'}`);
      console.log(`Approve/Deny buttons: ${hasApprove && hasDeny ? '✅' : '❌'}`);
      console.log(`OAuth Stub: ${p0Results.oauthStub ? '✅ WORKING' : '❌ FAILED'}`);
      
    } catch (error) {
      console.log('OAuth Stub: ❌ ERROR');
    }
    
    // P0 TEST 4: Event Viewer API
    console.log('\n📊 P0.4: EVENT-VIEWER API');
    console.log('========================');
    
    try {
      const eventResponse = await page.evaluate(async () => {
        const response = await fetch('/api/test/events?limit=10');
        return { status: response.status, data: await response.json() };
      });
      
      p0Results.eventViewer = eventResponse.status === 200 && eventResponse.data.success;
      
      console.log(`Event Viewer API: ${p0Results.eventViewer ? '✅' : '❌'}`);
      console.log(`Events available: ${eventResponse.data.events?.length || 0}`);
      
    } catch (error) {
      console.log('Event Viewer API: ❌ ERROR');
    }
    
    // P0 TEST 5: Smart Upsell with stable selectors
    console.log('\n💡 P0.5: SMART UPSELL + SELEKTOREN');
    console.log('=================================');
    
    // Go back to test Smart Upsell
    await page.goto('https://gastrotools-bulletproof.vercel.app/speisekarten-designer');
    
    // Wait for Smart Upsell after previous PDF export
    await page.waitForTimeout(3000);
    
    const smartUpsellToast = page.locator('[data-testid="smart-upsell-toast"]');
    const upsellVisible = await smartUpsellToast.count() > 0;
    
    if (upsellVisible) {
      const hasAriaLive = await smartUpsellToast.getAttribute('aria-live');
      const hasRoleStatus = await smartUpsellToast.getAttribute('role');
      
      console.log(`Smart Upsell Toast: ✅ VISIBLE`);
      console.log(`aria-live: ${hasAriaLive === 'polite' ? '✅' : '❌'} (${hasAriaLive})`);
      console.log(`role: ${hasRoleStatus === 'status' ? '✅' : '❌'} (${hasRoleStatus})`);
      
    } else {
      console.log('Smart Upsell Toast: ❌ NOT VISIBLE');
      console.log('   Note: May require fresh PDF export to trigger');
    }
    
    // FINAL P0 ASSESSMENT
    console.log('\n🏆 P0 TESTBARE ENABLER ASSESSMENT');
    console.log('=================================');
    
    const p0Features = [
      { name: 'Real PDF Export', status: p0Results.realPDFExport },
      { name: 'Magic-Link API', status: p0Results.magicLinkAPI },
      { name: 'OAuth Stub', status: p0Results.oauthStub },
      { name: 'Event Viewer API', status: p0Results.eventViewer },
      { name: 'Stable Selectors', status: p0Results.stableSelectors }
    ];
    
    const workingP0 = p0Features.filter(f => f.status).length;
    const p0Score = Math.round((workingP0 / p0Features.length) * 100);
    
    console.log(`P0 E2E-READINESS: ${workingP0}/5 (${p0Score}%)`);
    
    p0Features.forEach(feature => {
      console.log(`${feature.status ? '✅' : '❌'} ${feature.name}`);
    });
    
    if (p0Score >= 80) {
      console.log('\n🎉 P0 SUCCESS: E2E-Testing infrastructure ready!');
      console.log('🧪 Deterministic behavior achieved');
      console.log('🚀 Ready for comprehensive Playwright + Agent testing');
    } else if (p0Score >= 60) {
      console.log('\n🎯 P0 PARTIAL: Core infrastructure working');
      console.log(`🔧 ${5 - workingP0} components need attention`);
    } else {
      console.log('\n🚨 P0 ISSUES: Major testing infrastructure problems');
    }
    
    console.log('\n📋 E2E-TESTING READY APIs:');
    console.log('==========================');
    console.log('PDF Export: POST /api/export/pdf');
    console.log('Magic Links: GET /api/test/magic-links?email=test@example.com'); 
    console.log('OAuth Stub: GET /api/auth/oauth-stub?provider=google&email=test@example.com');
    console.log('Events: GET /api/test/events?limit=50');
    console.log('Selectors: [data-testid="export-pdf-btn"], [data-testid="smart-upsell-toast"]');
    
    await page.screenshot({ path: 'p0-enabler-verification.png' });
    
  } catch (error) {
    console.error('P0 enabler test error:', error);
  } finally {
    await browser.close();
  }
}

testP0EnablerLive();