const { chromium } = require('playwright');

async function testModalSizing() {
  console.log('📱 TESTING MODAL SIZING - READABILITY CHECK');
  console.log('==========================================');
  console.log('Testing: Tools/Features modal content visibility');
  
  const browser = await chromium.launch({ headless: false });
  
  // Test both desktop and mobile
  const desktop = await browser.newPage();
  const mobile = await browser.newPage();
  
  try {
    // Set viewports
    await mobile.setViewportSize({ width: 375, height: 812 }); // iPhone
    // Desktop uses default large viewport
    
    // Test on both devices
    for (const [device, page] of [['Desktop', desktop], ['Mobile', mobile]]) {
      console.log(`\n📱 TESTING ${device.toUpperCase()} MODAL`);
      console.log('='.repeat(30));
      
      await page.goto('https://gastrotools-bulletproof.vercel.app/signup-light');
      
      // Test Tools Modal
      console.log('\n🔧 Tools Modal Test:');
      console.log('-------------------');
      
      const toolsBtn = page.locator('button:has-text("Tools")');
      const toolsBtnExists = await toolsBtn.count() > 0;
      
      console.log(`Tools button exists: ${toolsBtnExists ? '✅' : '❌'}`);
      
      if (toolsBtnExists) {
        await toolsBtn.click();
        await page.waitForTimeout(1000);
        
        // Check if modal is visible
        const modal = page.locator('[role="dialog"], .fixed');
        const modalVisible = await modal.count() > 0;
        
        console.log(`Modal appears: ${modalVisible ? '✅' : '❌'}`);
        
        if (modalVisible) {
          // Check modal dimensions
          const modalBox = await modal.first().boundingBox();
          if (modalBox) {
            console.log(`Modal size: ${Math.round(modalBox.width)}x${Math.round(modalBox.height)}px`);
            
            // Check if modal fits in viewport
            const viewport = page.viewportSize();
            const fitsInViewport = modalBox.width <= viewport.width && modalBox.height <= viewport.height;
            console.log(`Fits in viewport: ${fitsInViewport ? '✅' : '❌'}`);
          }
          
          // Count visible tool cards
          const toolCards = await page.locator('.grid > div, .space-y-6 > div').count();
          console.log(`Tool cards visible: ${toolCards}`);
          
          // Check if all tool text is visible
          const toolTitles = await page.locator('h3, .text-lg').allTextContents();
          const visibleTitles = toolTitles.filter(title => title && title.length > 0);
          console.log(`Tool titles readable: ${visibleTitles.length} - ${visibleTitles.slice(0, 3).join(', ')}...`);
          
          // Check for cut-off content (scroll test)
          const scrollHeight = await page.evaluate(() => {
            const modal = document.querySelector('.overflow-y-auto, .fixed > div');
            if (modal) {
              return {
                scrollHeight: modal.scrollHeight,
                clientHeight: modal.clientHeight,
                scrollable: modal.scrollHeight > modal.clientHeight
              };
            }
            return null;
          });
          
          if (scrollHeight) {
            console.log(`Content scrollable: ${scrollHeight.scrollable ? '✅' : '❌'}`);
            console.log(`Content height: ${scrollHeight.scrollHeight}px, visible: ${scrollHeight.clientHeight}px`);
            
            if (scrollHeight.scrollable) {
              // Test scrolling
              await page.evaluate(() => {
                const modal = document.querySelector('.overflow-y-auto');
                if (modal) modal.scrollTop = modal.scrollHeight / 2;
              });
              
              await page.waitForTimeout(500);
              console.log('✅ Scroll test: Content scrollable');
            }
          }
          
          // Test close button
          const closeBtn = page.locator('button:has(svg)').first(); // X button
          const closeBtnVisible = await closeBtn.isVisible();
          console.log(`Close button visible: ${closeBtnVisible ? '✅' : '❌'}`);
          
          if (closeBtnVisible) {
            await closeBtn.click();
            await page.waitForTimeout(500);
            
            const modalClosed = await modal.count() === 0;
            console.log(`Modal closes: ${modalClosed ? '✅' : '❌'}`);
          }
        }
      }
      
      // Test Features Modal
      console.log('\n🎯 Features Modal Test:');
      console.log('---------------------');
      
      const featuresBtn = page.locator('button:has-text("Features")');
      const featuresBtnExists = await featuresBtn.count() > 0;
      
      if (featuresBtnExists) {
        await featuresBtn.click();
        await page.waitForTimeout(1000);
        
        const featuresModal = page.locator('[role="dialog"], .fixed');
        const featuresVisible = await featuresModal.count() > 0;
        
        console.log(`Features modal appears: ${featuresVisible ? '✅' : '❌'}`);
        
        if (featuresVisible) {
          const featureCards = await page.locator('.space-y-6 > div').count();
          console.log(`Feature cards visible: ${featureCards}`);
          
          const featureTitles = await page.locator('h3, .text-xl').allTextContents();
          const readableTitles = featureTitles.filter(title => title && title.includes('Smart') || title.includes('Analytics'));
          console.log(`Feature content readable: ${readableTitles.length} enterprise features`);
          
          // Close features modal
          const closeFeaturesBtn = page.locator('button:has(svg)').first();
          await closeFeaturesBtn.click();
          await page.waitForTimeout(500);
        }
      }
      
      await page.screenshot({ path: `modal-sizing-test-${device.toLowerCase()}.png` });
    }
    
    // FINAL MODAL ASSESSMENT
    console.log('\n🏆 MODAL SIZING ASSESSMENT');
    console.log('=========================');
    
    console.log('Modal sizing for both desktop and mobile tested');
    console.log('Key metrics: Visibility, scrollability, readability, close functionality');
    console.log('\n📋 Issues found will be visible in test output above');
    console.log('✅ If all metrics show ✅ → Modal sizing is perfect');
    console.log('❌ If metrics show ❌ → Need further sizing adjustments');
    
  } catch (error) {
    console.error('Modal sizing test error:', error);
  } finally {
    await browser.close();
  }
}

testModalSizing();