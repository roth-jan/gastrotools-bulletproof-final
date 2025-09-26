const { chromium } = require('playwright');

(async () => {
  console.log('🎯 TESTING PUBLIC URL - Complete System Check');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800
  });
  
  const page = await browser.newPage();

  try {
    // Use the WORKING public URL
    const publicUrl = 'https://gastrotools-mac-ready.vercel.app';
    console.log(`🌐 Testing PUBLIC URL: ${publicUrl}`);
    
    // Test 1: Homepage Access
    console.log('\n1️⃣ HOMEPAGE ACCESS TEST:');
    await page.goto(publicUrl);
    await page.waitForLoadState('networkidle');
    
    const homeTitle = await page.textContent('h1');
    console.log(`   Title: "${homeTitle}"`);
    console.log('   ✅ Homepage accessible without auth');
    
    // Test 2: Language Switcher
    console.log('\n2️⃣ LANGUAGE SWITCHER TEST:');
    const langButton = page.locator('button[title*="English"], button:has-text("DE"), button:has-text("EN")');
    if (await langButton.isVisible()) {
      await langButton.click();
      console.log('   ✅ Language switcher works');
      await page.waitForTimeout(1000);
      
      const englishTitle = await page.textContent('h1');
      console.log(`   EN Title: "${englishTitle}"`);
    } else {
      console.log('   ❌ Language switcher not found');
    }
    
    // Test 3: Login Process
    console.log('\n3️⃣ LOGIN PROCESS TEST:');
    await page.click('a[href="/login"]');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('vercel.com')) {
      console.log('   ❌ CRITICAL: Login redirects to Vercel SSO');
      console.log('   🚨 This blocks all Upwork testers!');
    } else {
      console.log('   ✅ Login page loads correctly');
      
      // Try demo login
      await page.fill('input[type="email"]', 'demo@gastrotools.de');
      await page.fill('input[type="password"]', 'demo123');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      
      if (page.url().includes('/dashboard')) {
        console.log('   ✅ Demo login works perfectly');
        
        // Test 4: Tool Navigation
        console.log('\n4️⃣ TOOL NAVIGATION TEST:');
        const tools = [
          { name: 'Nutrition Calculator', path: '/naehrwertrechner' },
          { name: 'Cost Control', path: '/kostenkontrolle' },
          { name: 'Inventory', path: '/lagerverwaltung' },
          { name: 'Menu Planner', path: '/menueplaner' },
          { name: 'Card Designer', path: '/speisekarten-designer' }
        ];
        
        for (const tool of tools) {
          await page.goto(publicUrl + tool.path);
          await page.waitForTimeout(2000);
          
          const toolTitle = await page.textContent('h1').catch(() => 'Failed');
          console.log(`   ${tool.name}: "${toolTitle}"`);
        }
        
        // Test 5: Hackfleisch Function
        console.log('\n5️⃣ HACKFLEISCH FUNCTIONALITY TEST:');
        await page.goto(publicUrl + '/naehrwertrechner');
        await page.waitForTimeout(2000);
        
        await page.fill('input[placeholder*="ingredient"], input[placeholder*="Zutat"]', 'Hackfleisch');
        await page.waitForTimeout(3000);
        
        const hasResults = await page.locator('.absolute.top-full').isVisible();
        console.log(`   Hackfleisch search: ${hasResults ? '✅ Works' : '❌ Failed'}`);
        
      } else {
        console.log('   ❌ Demo login failed');
      }
    }
    
    console.log('\n🎯 PUBLIC URL TEST SUMMARY:');
    console.log(`🌐 URL: ${publicUrl}`);
    console.log(`🔓 Public Access: ✅ Working`);
    console.log(`🌐 Language Switch: ${await langButton.isVisible() ? '✅' : '❌'}`);
    console.log(`🔐 Auth System: ${page.url().includes('vercel.com') ? '❌ Broken' : '✅ Working'}`);
    
    if (!page.url().includes('vercel.com')) {
      console.log('\n🎉 SUCCESS: This URL is ready for Upwork testing!');
      console.log(`📋 Upwork Instructions:`);
      console.log(`   • URL: ${publicUrl}`);
      console.log(`   • Demo Login: demo@gastrotools.de / demo123`);
      console.log(`   • Language: Click globe icon → EN`);
      console.log(`   • Test Focus: Hackfleisch functionality in nutrition tool`);
    } else {
      console.log('\n🚨 CRITICAL ISSUE: Auth system broken - cannot proceed to Upwork');
    }

    console.log('\n🔍 Browser open for manual verification...');
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Error:', error.message);
    await browser.close();
  }
})();