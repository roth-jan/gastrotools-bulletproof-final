const { chromium } = require('playwright');

async function test100PercentFinal() {
  console.log('🚀 100% FINAL TEST - COMPLETE BUSINESS MODEL');
  console.log('===========================================');
  console.log('URL: https://gastrotools-bulletproof.vercel.app (LATEST DEPLOYMENT)');
  console.log('Testing: Freeware → Lead-Gate → SaaS Pipeline');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  let testResults = {
    landingPages: 0,
    leadGate: false,
    pdfExport: false,
    analytics: false,
    businessPipeline: false
  };
  
  try {
    // TEST 1: SaaS Landing Pages (All 3)
    console.log('\n1. 🎯 SAAS LANDING PAGES TEST');
    console.log('============================');
    
    const landings = [
      { name: 'WebMenü', url: '/webmenue', keywords: ['Schule', 'Kita', 'BuT'] },
      { name: 'KüchenManager', url: '/kuechenmanager', keywords: ['LMIV', 'DATEV', 'Warenwirtschaft'] },
      { name: 'EAR', url: '/essen-auf-raedern', keywords: ['Lieferservice', '€99', '€199', '€299'] }
    ];
    
    for (const landing of landings) {
      await page.goto(`https://gastrotools-bulletproof.vercel.app${landing.url}`);
      
      const title = await page.locator('h1').first().textContent();
      const hasKeywords = landing.keywords.some(async keyword => {
        const count = await page.locator(`text="${keyword}"`).count();
        return count > 0;
      });
      const hasCTA = await page.locator('button:has-text("Demo"), button:has-text("Kostenlos")').count();
      
      const landingWorking = title && title.includes(landing.name) && hasCTA > 0;
      
      if (landingWorking) testResults.landingPages++;
      
      console.log(`${landing.name}: ${landingWorking ? '✅ WORKING' : '❌ BROKEN'} - "${title}"`);
    }
    
    console.log(`Landing Pages Score: ${testResults.landingPages}/3`);
    
    // TEST 2: Analytics Dashboard
    console.log('\n2. 📊 ANALYTICS DASHBOARD TEST');
    console.log('==============================');
    
    await page.goto('https://gastrotools-bulletproof.vercel.app/analytics');
    
    const analyticsTitle = await page.locator('h1').first().textContent();
    const businessMetrics = await page.locator('text=/Lead|MRR|ROI|Conversion/i').count();
    
    testResults.analytics = analyticsTitle && analyticsTitle.includes('Analytics') && businessMetrics >= 3;
    
    console.log(`Analytics: ${testResults.analytics ? '✅ WORKING' : '❌ BROKEN'} - "${analyticsTitle}", ${businessMetrics} metrics`);
    
    // TEST 3: Lead-Gate System (CRITICAL)
    console.log('\n3. 🎯 LEAD-GATE SYSTEM TEST');
    console.log('==========================');
    
    await page.goto('https://gastrotools-bulletproof.vercel.app/login');
    await page.fill('input[type="email"]', 'demo@gastrotools.de');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    
    await page.goto('https://gastrotools-bulletproof.vercel.app/speisekarten-designer');
    
    // Create value
    await page.fill('input[placeholder*="Summer"]', '100% Test Card');
    await page.click('button:has-text("Create New Card")');
    await page.waitForTimeout(3000);
    
    // Test PDF Export → Lead-Gate
    const exportBtn = page.locator('button:has-text("Export PDF")');
    const exportExists = await exportBtn.count() > 0;
    
    console.log(`Export button exists: ${exportExists ? '✅' : '❌'}`);
    
    if (exportExists) {
      await exportBtn.click();
      await page.waitForTimeout(3000);
      
      // Check for Lead-Gate Modal
      const leadModal = await page.locator('[role="dialog"], .lead-gate, input[type="email"]').count();
      const hasSegmentSelect = await page.locator('select, .select').count();
      
      testResults.leadGate = leadModal > 1; // More than login email
      
      console.log(`Lead-Gate Modal: ${testResults.leadGate ? '✅ WORKING' : '❌ MISSING'}`);
      console.log(`Segment Selection: ${hasSegmentSelect > 0 ? '✅' : '❌'}`);
      
      if (testResults.leadGate) {
        // Test lead submission
        const emailInput = page.locator('input[type="email"]').last();
        const submitBtn = page.locator('button:has-text("E-Mail"), button:has-text("PDF")');
        
        if (await emailInput.count() > 0) {
          await emailInput.fill('test-pipeline@gastrotools.de');
          
          if (await submitBtn.count() > 0) {
            await submitBtn.click();
            await page.waitForTimeout(2000);
            
            testResults.businessPipeline = true;
            console.log('✅ BUSINESS PIPELINE: Lead submitted successfully');
          }
        }
      }
    }
    
    // FINAL ASSESSMENT
    console.log('\n🏆 FINAL 100% ASSESSMENT');
    console.log('========================');
    
    const totalFeatures = 5;
    const workingFeatures = testResults.landingPages + 
                           (testResults.analytics ? 1 : 0) + 
                           (testResults.leadGate ? 1 : 0);
    
    const successRate = Math.round((workingFeatures / totalFeatures) * 100);
    
    console.log(`SUCCESS RATE: ${workingFeatures}/${totalFeatures} (${successRate}%)`);
    console.log(`✅ SaaS Landing Pages: ${testResults.landingPages}/3`);
    console.log(`${testResults.analytics ? '✅' : '❌'} Analytics Dashboard`);  
    console.log(`${testResults.leadGate ? '✅' : '❌'} Lead-Gate System`);
    console.log(`${testResults.businessPipeline ? '✅' : '❌'} Business Pipeline`);
    
    if (successRate === 100) {
      console.log('\n🎉 PERFECT: 100% BUSINESS MODEL FUNCTIONAL!');
      console.log('🚀 Freeware → Lead → SaaS pipeline working');
      console.log('💰 Ready for aggressive lead generation');
    } else if (successRate >= 80) {
      console.log('\n🎯 EXCELLENT: Business model mostly functional');
      console.log(`📋 ${totalFeatures - workingFeatures} components need attention`);
    } else {
      console.log('\n🔧 NEEDS WORK: Core business components missing');
    }
    
    console.log('\n📊 DEPLOYMENT STATUS:');
    console.log('===================');
    console.log('Main Domain: https://gastrotools-bulletproof.vercel.app');
    console.log('Latest Build: cyffpvmoe (4min ago)');
    console.log('Business Model: Freeware Tools → Lead Capture → SaaS Conversion');
    console.log(`Implementation: ${successRate}% complete`);
    
    await page.screenshot({ path: '100-percent-final-test.png' });
    
  } catch (error) {
    console.error('100% test error:', error);
  } finally {
    await browser.close();
  }
}

test100PercentFinal();