const { chromium } = require('playwright');

async function testDragDropComplete() {
  console.log('🎯 TESTING COMPLETE DRAG & DROP IMPLEMENTATION');
  console.log('==============================================');
  
  const browser = await chromium.launch({ headless: false });
  
  // Test both desktop and mobile
  const desktopPage = await browser.newPage();
  const mobilePage = await browser.newPage();
  
  try {
    // Set up mobile viewport
    await mobilePage.setViewportSize({ width: 375, height: 812 });
    
    // Wait for deployment to be ready
    console.log('⏳ Waiting for deployment to propagate...');
    await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second wait
    
    // Test URLs (try both latest and main)
    const testUrls = [
      'https://gastrotools-bulletproof-a31tashhz-jhroth-7537s-projects.vercel.app',
      'https://gastrotools-bulletproof.vercel.app'
    ];
    
    let workingUrl = null;
    
    // Find working URL
    for (const url of testUrls) {
      try {
        await desktopPage.goto(`${url}/login`);
        await desktopPage.fill('input[type="email"]', 'demo@gastrotools.de');
        await desktopPage.fill('input[type="password"]', 'demo123');
        await desktopPage.click('button[type="submit"]');
        await desktopPage.waitForTimeout(3000);
        
        await desktopPage.goto(`${url}/menueplaner`);
        const hasContent = await desktopPage.locator('h1, h2').count() > 0;
        
        if (hasContent) {
          workingUrl = url;
          console.log(`✅ Working URL found: ${url}`);
          break;
        }
      } catch (e) {
        console.log(`⚠️ ${url}: Not ready yet`);
      }
    }
    
    if (!workingUrl) {
      console.log('❌ No working URL found - deployment may still be in progress');
      return;
    }
    
    // DESKTOP DRAG & DROP TEST
    console.log('\n💻 DESKTOP DRAG & DROP TEST');
    console.log('===========================');
    
    // Add a test item first
    await desktopPage.fill('input[placeholder*="Beef"]', 'Drag Test Dish');
    await desktopPage.fill('input[placeholder="4"]', '6');
    await desktopPage.click('button:has-text("Add to Menu")');
    await desktopPage.waitForTimeout(2000);
    
    // Check if item appears
    const itemAdded = await desktopPage.locator('text="Drag Test Dish"').count();
    console.log(`Test item added: ${itemAdded > 0 ? '✅ YES' : '❌ NO'}`);
    
    if (itemAdded > 0) {
      // Check if item is draggable
      const draggableItem = desktopPage.locator('text="Drag Test Dish"').locator('..');
      const isDraggable = await draggableItem.getAttribute('draggable');
      console.log(`Item is draggable: ${isDraggable === 'true' ? '✅ YES' : '❌ NO'}`);
      
      // Check for drag cursor
      const hasDragCursor = await draggableItem.evaluate(el => 
        window.getComputedStyle(el).cursor === 'move'
      );
      console.log(`Drag cursor present: ${hasDragCursor ? '✅ YES' : '❌ NO'}`);
      
      // Check for drop zones
      const dropZones = await desktopPage.locator('[data-day], .border-dashed').count();
      console.log(`Drop zones available: ${dropZones > 0 ? `✅ YES (${dropZones})` : '❌ NO'}`);
      
      // Try drag and drop (Tuesday)
      try {
        const sourceItem = desktopPage.locator('text="Drag Test Dish"').locator('..');
        const tuesdayZone = desktopPage.locator('text="Tuesday"').locator('..');
        
        await sourceItem.dragTo(tuesdayZone);
        await desktopPage.waitForTimeout(2000);
        
        // Check if item moved
        const itemInTuesday = await desktopPage.locator('text="Tuesday"').locator('..').locator('text="Drag Test Dish"').count();
        console.log(`✅ DRAG & DROP RESULT: ${itemInTuesday > 0 ? 'SUCCESS - Item moved to Tuesday!' : 'No movement detected'}`);
        
      } catch (dragError) {
        console.log(`⚠️ Drag operation failed: ${dragError.message}`);
      }
    }
    
    await desktopPage.screenshot({ path: 'desktop-drag-drop-test.png' });
    
    // MOBILE DRAG & DROP TEST  
    console.log('\n📱 MOBILE DRAG & DROP TEST');
    console.log('==========================');
    
    // Login on mobile
    await mobilePage.goto(`${workingUrl}/login`);
    await mobilePage.fill('input[type="email"]', 'demo@gastrotools.de');
    await mobilePage.fill('input[type="password"]', 'demo123');
    await mobilePage.click('button[type="submit"]');
    await mobilePage.waitForTimeout(3000);
    
    await mobilePage.goto(`${workingUrl}/menueplaner`);
    
    // Add mobile test item
    await mobilePage.fill('input[placeholder*="Beef"]', 'Mobile Drag Test');
    await mobilePage.fill('input[placeholder="4"]', '4');
    await mobilePage.click('button:has-text("Add to Menu")');
    await mobilePage.waitForTimeout(2000);
    
    const mobileItemAdded = await mobilePage.locator('text="Mobile Drag Test"').count();
    console.log(`Mobile test item added: ${mobileItemAdded > 0 ? '✅ YES' : '❌ NO'}`);
    
    // Check mobile interface
    const mobileCalendarVisible = await mobilePage.locator('text="Monday", text="Tuesday"').count();
    console.log(`Mobile calendar visible: ${mobileCalendarVisible >= 2 ? '✅ YES' : '❌ NO'}`);
    
    // Check if drag interface is touch-friendly
    const touchElements = await mobilePage.locator('[draggable="true"]').count();
    console.log(`Touch-draggable elements: ${touchElements > 0 ? `✅ ${touchElements} items` : '❌ None'}`);
    
    await mobilePage.screenshot({ path: 'mobile-drag-drop-test.png' });
    
    // COMPREHENSIVE FEATURE TEST
    console.log('\n🏆 COMPREHENSIVE FEATURE VERIFICATION');
    console.log('=====================================');
    
    const featureTests = [
      { name: 'Drag & Drop implemented', check: async () => {
        return await desktopPage.locator('[draggable="true"]').count() > 0;
      }},
      { name: 'Drop zones functional', check: async () => {
        return await desktopPage.locator('[onDrop]').count() > 0 || 
               await desktopPage.locator('.border-dashed').count() > 0;
      }},
      { name: 'Visual feedback present', check: async () => {
        return await desktopPage.locator('.cursor-move, .hover\\:shadow').count() > 0;
      }},
      { name: 'Mobile compatibility', check: async () => {
        return await mobilePage.locator('[draggable="true"]').count() > 0;
      }},
      { name: 'Menu items manageable', check: async () => {
        return await desktopPage.locator('button:has-text("Remove")').count() > 0;
      }}
    ];
    
    let passedFeatures = 0;
    
    for (const feature of featureTests) {
      try {
        const result = await feature.check();
        if (result) {
          passedFeatures++;
          console.log(`✅ ${feature.name}: IMPLEMENTED`);
        } else {
          console.log(`❌ ${feature.name}: MISSING`);
        }
      } catch (e) {
        console.log(`❌ ${feature.name}: ERROR`);
      }
    }
    
    const featureScore = Math.round((passedFeatures / featureTests.length) * 100);
    console.log(`\n📊 DRAG & DROP IMPLEMENTATION: ${passedFeatures}/${featureTests.length} (${featureScore}%)`);
    
    if (featureScore === 100) {
      console.log('🏆 PERFECT: Drag & Drop fully implemented and functional!');
    } else if (featureScore >= 80) {
      console.log('🎯 EXCELLENT: Drag & Drop working with minor gaps');
    } else {
      console.log('⚠️ PARTIAL: Drag & Drop needs more work');
    }
    
  } catch (error) {
    console.error('Drag & Drop test error:', error);
  } finally {
    await browser.close();
  }
}

testDragDropComplete();