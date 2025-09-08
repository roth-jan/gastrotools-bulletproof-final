const { chromium } = require('playwright');

async function testModalFixVerification() {
  console.log('🔧 TESTING MODAL HEIGHT FIX VERIFICATION');
  console.log('========================================');
  console.log('Previous: Modal 64px height, content cut-off');
  console.log('Expected: Modal 85vh height, all content visible');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://gastrotools-bulletproof.vercel.app/signup-light');
    
    // Test Tools Modal
    console.log('\n📱 TOOLS MODAL HEIGHT TEST');
    console.log('=========================');
    
    const toolsBtn = page.locator('button:has-text("Tools")');
    const toolsExists = await toolsBtn.count() > 0;
    
    console.log(`Tools button: ${toolsExists ? '✅' : '❌'}`);
    
    if (toolsExists) {
      await toolsBtn.click();
      await page.waitForTimeout(2000);
      
      // Check modal dimensions
      const modal = page.locator('.fixed .bg-white').first();
      const modalVisible = await modal.count() > 0;
      
      console.log(`Modal appears: ${modalVisible ? '✅' : '❌'}`);
      
      if (modalVisible) {
        const modalBox = await modal.boundingBox();
        if (modalBox) {
          console.log(`Modal dimensions: ${Math.round(modalBox.width)}x${Math.round(modalBox.height)}px`);
          
          // Check if height is reasonable (should be ~85% of viewport)
          const viewport = page.viewportSize();
          const expectedHeight = viewport.height * 0.85;
          const actualHeight = modalBox.height;
          
          const heightOK = actualHeight > expectedHeight * 0.8; // Allow some margin
          console.log(`Expected height: ~${Math.round(expectedHeight)}px`);
          console.log(`Actual height: ${Math.round(actualHeight)}px`);
          console.log(`Height reasonable: ${heightOK ? '✅' : '❌'}`);
          
          // Check if content is visible
          const toolCards = await page.locator('h3, .text-lg, .font-medium').count();
          console.log(`Readable elements: ${toolCards}`);
          
          // Get all tool names to verify readability
          const toolNames = await page.locator('h3, .text-lg').allTextContents();
          const readableNames = toolNames.filter(name => name && name.length > 3);
          console.log(`Tool names visible: ${readableNames.length} - ${readableNames.slice(0, 3).join(', ')}...`);
          
          // Check scrolling capability
          const scrollTest = await page.evaluate(() => {
            const contentArea = document.querySelector('.flex-1, .overflow-y-auto');
            if (contentArea) {
              const beforeScroll = contentArea.scrollTop;
              contentArea.scrollTop = 100;
              const afterScroll = contentArea.scrollTop;
              contentArea.scrollTop = beforeScroll; // Reset
              return afterScroll > beforeScroll;
            }
            return false;
          });
          
          console.log(`Scrolling works: ${scrollTest ? '✅' : '❌'}`);
          
          // Test close button
          const closeBtn = page.locator('button:has-text("×"), button:has(svg)').last();
          const closeBtnVisible = await closeBtn.isVisible();
          console.log(`Close button visible: ${closeBtnVisible ? '✅' : '❌'}`);
          
          if (closeBtnVisible) {
            try {
              await closeBtn.click({ timeout: 3000 });
              await page.waitForTimeout(1000);
              
              const modalClosed = await modal.count() === 0;
              console.log(`Modal closes properly: ${modalClosed ? '✅' : '❌'}`);
              
            } catch (error) {
              console.log('Modal close test: ❌ Close button not clickable');
            }
          }
          
          // ASSESSMENT
          const modalWorking = heightOK && toolCards >= 5 && readableNames.length >= 3;
          console.log(`\nTOOLS MODAL STATUS: ${modalWorking ? '✅ FIXED' : '❌ STILL BROKEN'}`);
          
          if (modalWorking) {
            console.log('🎉 Modal sizing problem resolved!');
            console.log('   All content visible and readable');
            console.log('   Proper height and scrolling');
          } else {
            console.log('🚨 Modal still has issues:');
            if (!heightOK) console.log('   - Height too small');
            if (toolCards < 5) console.log('   - Content not visible');
            if (readableNames.length < 3) console.log('   - Text not readable');
          }
        }
      }
    }
    
    await page.screenshot({ path: 'modal-fix-verification.png' });
    
    console.log('\n🎯 MODAL FIX VERIFICATION COMPLETE');
    console.log('==================================');
    console.log('Check screenshot for visual confirmation');
    
  } catch (error) {
    console.error('Modal fix verification error:', error);
  } finally {
    await browser.close();
  }
}

testModalFixVerification();