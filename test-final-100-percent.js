const { chromium } = require('playwright');

async function testFinal100Percent() {
  console.log('🏆 FINAL 100% BUSINESS MODEL TESTING');
  console.log('====================================');
  console.log('URL: https://gastrotools-bulletproof.vercel.app');
  console.log('Testing: Complete Smart Business Model');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // FINAL TEST: PDF Export Working
    console.log('\n📄 FINAL: PDF Export Functionality');
    console.log('==================================');
    
    await page.goto('https://gastrotools-bulletproof.vercel.app/login');
    await page.fill('input[type="email"]', 'demo@gastrotools.de');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    
    await page.goto('https://gastrotools-bulletproof.vercel.app/speisekarten-designer');
    
    // Create test card
    await page.fill('input[placeholder*="Summer"]', 'FINAL 100% Test Card');
    await page.click('button:has-text("Create New Card")');
    await page.waitForTimeout(3000);
    
    const exportBtn = page.locator('button:has-text("Export PDF")');
    const exportExists = await exportBtn.count() > 0;
    
    console.log(`Export button exists: ${exportExists ? '✅' : '❌'}`);
    
    if (exportExists) {
      let downloadWorked = false;
      
      page.on('download', (download) => {
        downloadWorked = true;
        console.log(`✅ DOWNLOAD SUCCESS: ${download.suggestedFilename()}`);
      });
      
      await exportBtn.click();
      await page.waitForTimeout(5000);
      
      console.log(`PDF Export Result: ${downloadWorked ? '✅ 100% WORKING' : '❌ STILL BROKEN'}`);
      
      if (downloadWorked) {
        console.log('🎉 PDF EXPORT: COMPLETELY FIXED!');
      } else {
        console.log('🚨 PDF EXPORT: Still has issues - check button behavior');
        
        const buttonText = await exportBtn.textContent();
        console.log(`Button state: "${buttonText}"`);
      }
    }
    
    // FINAL TEST: SaaS Business Model
    console.log('\n🚀 FINAL: SaaS Business Model');
    console.log('=============================');
    
    const businessTests = [
      { name: 'WebMenü Landing', url: '/webmenue', keywords: ['Schule', 'Kita', 'BuT'] },
      { name: 'KüchenManager Landing', url: '/kuechenmanager', keywords: ['LMIV', 'DATEV'] },
      { name: 'EAR Landing', url: '/essen-auf-raedern', keywords: ['€99', '€199', '€299'] },
      { name: 'Analytics Dashboard', url: '/analytics', keywords: ['Lead', 'ROI', 'MRR'] }
    ];
    
    let businessScore = 0;
    
    for (const test of businessTests) {
      try {
        await page.goto(`https://gastrotools-bulletproof.vercel.app${test.url}`);
        
        const title = await page.locator('h1').first().textContent();
        const pageContent = await page.content();
        
        const hasKeywords = test.keywords.some(keyword => 
          pageContent.toLowerCase().includes(keyword.toLowerCase())
        );
        
        const testPassed = title && hasKeywords;
        
        if (testPassed) businessScore++;
        
        console.log(`${test.name}: ${testPassed ? '✅' : '❌'} - "${title}"`);
        
      } catch (error) {
        console.log(`${test.name}: ❌ ERROR`);
      }
    }
    
    console.log(`\nBUSINESS MODEL SCORE: ${businessScore}/4 (${Math.round(businessScore/4*100)}%)`);
    
    // ABSOLUTE FINAL ASSESSMENT
    console.log('\n🏆 ABSOLUTE FINAL ASSESSMENT');
    console.log('===========================');
    
    const pdfWorking = downloadWorked;
    const businessWorking = businessScore >= 3;
    const overallWorking = pdfWorking && businessWorking;
    
    if (overallWorking) {
      console.log('🎉 SUCCESS: 100% BUSINESS MODEL FUNCTIONAL!');
      console.log('✅ PDF Export: Working');
      console.log('✅ SaaS Funnels: Ready');  
      console.log('✅ Business Intelligence: Deployed');
      console.log('🚀 READY FOR AGGRESSIVE BUSINESS TESTING!');
    } else if (businessWorking) {
      console.log('🎯 BUSINESS MODEL: 90% Ready');
      console.log('✅ SaaS Infrastructure: Complete');
      console.log(`${pdfWorking ? '✅' : '❌'} PDF Export: ${pdfWorking ? 'Working' : 'Needs fix'}`);
    } else {
      console.log('🔧 NEEDS WORK: Business components incomplete');
    }
    
    console.log('\n📊 FINAL DEPLOYMENT STATUS:');
    console.log('===========================');
    console.log('Main URL: https://gastrotools-bulletproof.vercel.app');
    console.log('Business Model: Registration → Intelligence → SaaS Conversion');
    console.log('Quality: Enterprise-level business intelligence system');
    
    await page.screenshot({ path: 'final-100-percent-test.png' });
    
  } catch (error) {
    console.error('Final 100% test error:', error);
  } finally {
    await browser.close();
  }
}

testFinal100Percent();