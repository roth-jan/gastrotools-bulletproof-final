const { chromium } = require('playwright');

async function testOAuthRealIntegration() {
  console.log('🔐 SELF-TESTING: REAL OAUTH INTEGRATION');
  console.log('======================================');
  console.log('URL: https://gastrotools-bulletproof.vercel.app');
  console.log('Testing: Google/Microsoft OAuth functionality');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Test OAuth buttons from signup-light
    console.log('\n1. 🔍 OAuth Buttons Accessibility');
    console.log('=================================');
    
    await page.goto('https://gastrotools-bulletproof.vercel.app/signup-light');
    
    const googleBtn = page.locator('button:has-text("Google")');
    const microsoftBtn = page.locator('button:has-text("Microsoft")');
    
    const googleExists = await googleBtn.count() > 0;
    const microsoftExists = await microsoftBtn.count() > 0;
    
    console.log(`Google button exists: ${googleExists ? '✅' : '❌'}`);
    console.log(`Microsoft button exists: ${microsoftExists ? '✅' : '❌'}`);
    
    if (!googleExists) {
      console.log('❌ Cannot test OAuth - buttons missing');
      return;
    }
    
    // Test Google OAuth flow
    console.log('\n2. 🚀 Google OAuth Flow Test');
    console.log('============================');
    
    let oauthFlowResult = {
      buttonClicked: false,
      redirectOccurred: false,
      realGoogleOAuth: false,
      developmentFallback: false,
      errorOccurred: false
    };
    
    // Monitor navigation
    page.on('framenavigated', (frame) => {
      const url = frame.url();
      console.log(`Navigation: ${url}`);
      
      if (url.includes('accounts.google.com')) {
        oauthFlowResult.realGoogleOAuth = true;
        console.log('✅ REAL Google OAuth detected!');
      } else if (url.includes('oauth-dev')) {
        oauthFlowResult.developmentFallback = true;
        console.log('⚠️ Development fallback (no OAuth credentials)');
      } else if (url.includes('error')) {
        oauthFlowResult.errorOccurred = true;
        console.log('❌ OAuth error occurred');
      }
    });
    
    // Monitor new tabs/popups
    page.on('popup', async (popup) => {
      oauthFlowResult.redirectOccurred = true;
      const popupUrl = popup.url();
      console.log(`Popup opened: ${popupUrl}`);
      
      if (popupUrl.includes('accounts.google.com')) {
        oauthFlowResult.realGoogleOAuth = true;
        console.log('🎉 REAL Google OAuth popup!');
      }
      
      await popup.close();
    });
    
    console.log('🖱️ Clicking Google OAuth button...');
    
    try {
      await googleBtn.click();
      oauthFlowResult.buttonClicked = true;
      
      // Wait for OAuth flow to start
      await page.waitForTimeout(5000);
      
    } catch (error) {
      console.log(`❌ Button click failed: ${error.message}`);
    }
    
    // Analyze OAuth flow result
    console.log('\n📊 OAuth Flow Analysis:');
    console.log('======================');
    console.log(`Button clicked: ${oauthFlowResult.buttonClicked ? '✅' : '❌'}`);
    console.log(`Redirect occurred: ${oauthFlowResult.redirectOccurred ? '✅' : '❌'}`);
    console.log(`Real Google OAuth: ${oauthFlowResult.realGoogleOAuth ? '✅ SUCCESS' : '❌ Not reached'}`);
    console.log(`Development fallback: ${oauthFlowResult.developmentFallback ? '⚠️ Used' : '❌ Not used'}`);
    console.log(`Error occurred: ${oauthFlowResult.errorOccurred ? '❌ Yes' : '✅ No'}`);
    
    // Check current page URL for clues
    const currentUrl = page.url();
    console.log(`\nCurrent page URL: ${currentUrl}`);
    
    if (currentUrl.includes('oauth-dev')) {
      console.log('📍 ON DEVELOPMENT FALLBACK PAGE');
      
      // Test development OAuth completion
      const nameInput = page.locator('input[placeholder*="Mustermann"]');
      const companyInput = page.locator('input[placeholder*="Muster"]');
      
      if (await nameInput.count() > 0) {
        await nameInput.fill('OAuth Test User');
        console.log('✅ Name filled in dev OAuth');
      }
      
      if (await companyInput.count() > 0) {
        await companyInput.fill('OAuth Test Company');
        console.log('✅ Company filled in dev OAuth');
      }
      
      const completeBtn = page.locator('button:has-text("OAuth abschließen")');
      if (await completeBtn.count() > 0) {
        await completeBtn.click();
        await page.waitForTimeout(3000);
        
        const finalUrl = page.url();
        console.log(`Final URL after OAuth completion: ${finalUrl}`);
        
        if (finalUrl.includes('dashboard')) {
          console.log('✅ OAuth DEV FLOW: Complete and working');
        }
      }
      
    } else if (currentUrl.includes('accounts.google.com')) {
      console.log('📍 ON REAL GOOGLE OAUTH');
      console.log('🎉 REAL OAUTH WORKING: Redirected to actual Google');
      
    } else if (currentUrl.includes('signup-light')) {
      console.log('📍 STILL ON SIGNUP PAGE');
      
      // Check for error messages
      const errorMsg = await page.locator('text=/error|fehler|failed/i').count();
      if (errorMsg > 0) {
        const errorText = await page.locator('text=/error|fehler|failed/i').first().textContent();
        console.log(`Error message: "${errorText}"`);
      }
      
      // Check browser console for OAuth logs
      const logs = await page.evaluate(() => {
        return window.console.logs || [];
      });
      
      console.log(`Browser console logs available: ${logs.length > 0 ? '✅' : '❌'}`);
    }
    
    // FINAL OAUTH ASSESSMENT
    console.log('\n🏆 OAUTH INTEGRATION ASSESSMENT');
    console.log('===============================');
    
    if (oauthFlowResult.realGoogleOAuth) {
      console.log('🎉 PERFECT: Real Google OAuth working!');
      console.log('   Users get authentic Google login experience');
    } else if (oauthFlowResult.developmentFallback) {
      console.log('🔧 PARTIAL: Development fallback working');
      console.log('   OAuth credentials needed for production');
    } else if (oauthFlowResult.buttonClicked) {
      console.log('⚠️ ISSUE: Button works but OAuth flow broken');
      console.log('   API endpoints may have errors');
    } else {
      console.log('❌ BROKEN: OAuth buttons not functional');
      console.log('   Integration needs fixing');
    }
    
    await page.screenshot({ path: 'oauth-real-integration-test.png' });
    
  } catch (error) {
    console.error('OAuth integration test error:', error);
  } finally {
    await browser.close();
  }
}

testOAuthRealIntegration();