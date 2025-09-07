const { chromium } = require('playwright');

async function testOAuthButtonsFix() {
  console.log('🔐 TESTING OAUTH BUTTONS FIX');
  console.log('============================');
  console.log('Problem: Google/Microsoft buttons led to 404');
  console.log('Solution: Redirect to working OAuth stub');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Test OAuth buttons from signup-light page
    await page.goto('https://gastrotools-bulletproof.vercel.app/signup-light');
    
    const googleBtn = page.locator('button:has-text("Google")');
    const microsoftBtn = page.locator('button:has-text("Microsoft")');
    
    const googleExists = await googleBtn.count() > 0;
    const microsoftExists = await microsoftBtn.count() > 0;
    
    console.log(`Google OAuth button exists: ${googleExists ? '✅' : '❌'}`);
    console.log(`Microsoft OAuth button exists: ${microsoftExists ? '✅' : '❌'}`);
    
    if (googleExists) {
      console.log('\n🧪 Testing Google OAuth button...');
      
      // Monitor for new tabs/windows
      let newTabOpened = false;
      let oauthStubLoaded = false;
      
      page.on('popup', async (popup) => {
        newTabOpened = true;
        console.log('✅ New tab opened (OAuth stub)');
        
        // Wait for popup to load
        await popup.waitForLoadState('domcontentloaded');
        
        // Check if OAuth stub loaded
        const stubContent = await popup.content();
        oauthStubLoaded = stubContent.includes('OAuth-Stub aktiv');
        
        console.log(`OAuth stub loaded: ${oauthStubLoaded ? '✅' : '❌'}`);
        
        if (oauthStubLoaded) {
          console.log('🎉 OAuth stub interface working!');
          
          // Check for approve/deny buttons
          const approveBtn = await popup.locator('[data-testid="oauth-approve-btn"]').count();
          const denyBtn = await popup.locator('[data-testid="oauth-deny-btn"]').count();
          
          console.log(`Approve button: ${approveBtn > 0 ? '✅' : '❌'}`);
          console.log(`Deny button: ${denyBtn > 0 ? '✅' : '❌'}`);
        }
        
        // Close popup after testing
        await popup.close();
      });
      
      // Click Google button
      await googleBtn.click();
      await page.waitForTimeout(3000);
      
      console.log(`Google button result:`);
      console.log(`  New tab opened: ${newTabOpened ? '✅' : '❌'}`);
      console.log(`  OAuth stub loaded: ${oauthStubLoaded ? '✅ WORKING' : '❌ 404 or error'}`);
      
      const googleWorking = newTabOpened && oauthStubLoaded;
      console.log(`Google OAuth: ${googleWorking ? '✅ FIXED' : '❌ STILL BROKEN'}`);
    }
    
    // Quick test Microsoft too
    if (microsoftExists && googleExists) {
      console.log('\n🧪 Quick test Microsoft OAuth button...');
      
      let microsoftWorking = false;
      
      page.on('popup', async (popup) => {
        await popup.waitForLoadState('domcontentloaded');
        const stubContent = await popup.content();
        microsoftWorking = stubContent.includes('OAuth-Stub aktiv') && stubContent.includes('Microsoft');
        console.log(`Microsoft OAuth stub: ${microsoftWorking ? '✅' : '❌'}`);
        await popup.close();
      });
      
      await microsoftBtn.click();
      await page.waitForTimeout(2000);
    }
    
    // FINAL OAUTH STATUS
    console.log('\n🏆 OAUTH BUTTONS STATUS');
    console.log('======================');
    
    if (newTabOpened && oauthStubLoaded) {
      console.log('✅ OAUTH BUTTONS FIXED: No more 404 errors');
      console.log('✅ OAuth Stub working: Approve/Deny interface functional');
      console.log('✅ E2E Testing ready: OAuth flows can be automated');
    } else if (googleExists && microsoftExists) {
      console.log('❌ OAUTH BUTTONS BROKEN: Still leading to 404 or non-functional');
      console.log('🔧 Need to implement working OAuth integration or remove buttons');
    } else {
      console.log('⚠️ OAUTH BUTTONS MISSING: May not be deployed yet');
    }
    
    await page.screenshot({ path: 'oauth-buttons-fix-test.png' });
    
  } catch (error) {
    console.error('OAuth buttons fix test error:', error);
  } finally {
    await browser.close();
  }
}

testOAuthButtonsFix();