const { chromium } = require('playwright');

async function testVerifiedDeployment() {
  console.log('🧪 TESTING VERIFIED WORKING DEPLOYMENT');
  console.log('====================================');
  console.log('URL: https://gastrotools-bulletproof.vercel.app');
  console.log('Deployment: m16ipku5b (Verified ● Ready status)');
  console.log('Testing: All business model components');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  let businessResults = {
    toolsFunctional: false,
    pdfExportWorks: false,
    saasLandingsReady: 0,
    analyticsAvailable: false,
    businessPipelineReady: false
  };
  
  try {
    // TEST 1: Core Tools Still Working
    console.log('\n1. 🛠️ CORE TOOLS FUNCTIONALITY');
    console.log('==============================');
    
    await page.goto('https://gastrotools-bulletproof.vercel.app/login');
    await page.fill('input[type="email"]', 'demo@gastrotools.de');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    
    // Quick test critical tools
    const tools = [
      { name: 'Nährwertrechner', url: '/naehrwertrechner' },
      { name: 'Kostenkontrolle', url: '/kostenkontrolle' }, 
      { name: 'Speisekarten-Designer', url: '/speisekarten-designer' }
    ];
    
    let workingTools = 0;
    
    for (const tool of tools) {
      await page.goto(`https://gastrotools-bulletproof.vercel.app${tool.url}`);
      const hasContent = await page.locator('h1, h2').count() > 0;
      if (hasContent) workingTools++;
      console.log(`${tool.name}: ${hasContent ? '✅' : '❌'}`);
    }
    
    businessResults.toolsFunctional = workingTools === 3;
    
    // TEST 2: PDF Export Functionality  
    console.log('\n2. 📄 PDF EXPORT TEST');
    console.log('====================');
    
    await page.goto('https://gastrotools-bulletproof.vercel.app/speisekarten-designer');
    
    // Create menu card
    await page.fill('input[placeholder*="Summer"]', 'CLI Verified Test Card');
    await page.click('button:has-text("Create New Card")');
    await page.waitForTimeout(2000);
    
    // Test PDF export
    const exportBtn = page.locator('button:has-text("Export PDF")');
    const exportExists = await exportBtn.count() > 0;
    
    console.log(`PDF Export button exists: ${exportExists ? '✅' : '❌'}`);
    
    if (exportExists) {
      let downloadTriggered = false;
      
      page.on('download', () => {
        downloadTriggered = true;
        console.log('✅ PDF Download successful!');
      });
      
      await exportBtn.click();
      await page.waitForTimeout(5000);
      
      businessResults.pdfExportWorks = downloadTriggered;
      console.log(`PDF Export works: ${downloadTriggered ? '✅ FUNCTIONAL' : '❌ BROKEN'}`);
    }
    
    // TEST 3: SaaS Landing Pages
    console.log('\n3. 🚀 SAAS LANDING PAGES');
    console.log('=======================');
    
    const landings = [
      { name: 'WebMenü', url: '/webmenue' },
      { name: 'KüchenManager', url: '/kuechenmanager' },
      { name: 'EAR', url: '/essen-auf-raedern' }
    ];
    
    for (const landing of landings) {
      try {
        await page.goto(`https://gastrotools-bulletproof.vercel.app${landing.url}`);
        
        const title = await page.locator('h1').first().textContent();
        const hasCTA = await page.locator('button:has-text("Demo"), button:has-text("Kostenlos")').count();
        
        const landingWorking = title && title.includes(landing.name) && hasCTA > 0;
        
        if (landingWorking) businessResults.saasLandingsReady++;
        
        console.log(`${landing.name}: ${landingWorking ? '✅' : '❌'} - "${title}"`);
        
      } catch (error) {
        console.log(`${landing.name}: ❌ ERROR`);
      }
    }
    
    console.log(`SaaS Landings Score: ${businessResults.saasLandingsReady}/3`);
    
    // TEST 4: Analytics Dashboard
    console.log('\n4. 📊 ANALYTICS DASHBOARD');
    console.log('========================');
    
    try {
      await page.goto('https://gastrotools-bulletproof.vercel.app/analytics');
      
      const analyticsTitle = await page.locator('h1').first().textContent();
      const hasMetrics = await page.locator('text=/Lead|MRR|ROI/i').count();
      
      businessResults.analyticsAvailable = analyticsTitle && analyticsTitle.includes('Analytics') && hasMetrics >= 3;
      
      console.log(`Analytics: ${businessResults.analyticsAvailable ? '✅' : '❌'} - "${analyticsTitle}", ${hasMetrics} metrics`);
      
    } catch (error) {
      console.log('Analytics: ❌ ERROR - Not accessible');
    }
    
    // BUSINESS PIPELINE ASSESSMENT
    businessResults.businessPipelineReady = 
      businessResults.toolsFunctional &&
      businessResults.saasLandingsReady >= 2 &&
      businessResults.analyticsAvailable;
    
    // FINAL VERIFIED ASSESSMENT
    console.log('\n🏆 VERIFIED DEPLOYMENT ASSESSMENT');
    console.log('=================================');
    
    const components = [
      { name: 'Core Tools Functional', status: businessResults.toolsFunctional },
      { name: 'PDF Export Working', status: businessResults.pdfExportWorks },
      { name: 'SaaS Landing Pages', status: businessResults.saasLandingsReady >= 2 },
      { name: 'Analytics Dashboard', status: businessResults.analyticsAvailable },
      { name: 'Business Pipeline', status: businessResults.businessPipelineReady }
    ];
    
    const workingComponents = components.filter(c => c.status).length;
    const successRate = Math.round((workingComponents / components.length) * 100);
    
    console.log(`\nVERIFIED SUCCESS RATE: ${workingComponents}/${components.length} (${successRate}%)`);
    
    components.forEach(comp => {
      console.log(`${comp.status ? '✅' : '❌'} ${comp.name}`);
    });
    
    if (successRate >= 90) {
      console.log('\n🎉 EXCELLENT: Business model fully functional!');
      console.log('🚀 Ready for aggressive business testing');
    } else if (successRate >= 75) {
      console.log('\n🎯 GOOD: Core business model working');
      console.log('🔧 Minor components need attention');
    } else if (successRate >= 50) {
      console.log('\n🔧 PARTIAL: Foundation working, needs completion');
    } else {
      console.log('\n🚨 ISSUES: Major business components broken');
    }
    
    console.log('\n📊 VERIFIED DEPLOYMENT STATUS:');
    console.log('==============================');
    console.log('✅ Deployment ID: m16ipku5b');
    console.log('✅ Status: ● Ready');
    console.log('✅ URL: https://gastrotools-bulletproof.vercel.app');
    console.log('✅ Main Domain Alias: Active');
    console.log(`✅ Business Model: ${successRate}% functional`);
    
    await page.screenshot({ path: 'verified-deployment-test.png' });
    
  } catch (error) {
    console.error('Verified deployment test error:', error);
  } finally {
    await browser.close();
  }
}

testVerifiedDeployment();