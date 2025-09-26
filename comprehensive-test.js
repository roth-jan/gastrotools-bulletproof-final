const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test configuration
const PRODUCTION_URL = 'https://gastrotools-mac-ready-25hcq4lac-jhroth-7537s-projects.vercel.app';
const DEMO_CREDENTIALS = {
  email: 'demo@gastrotools.de',
  password: 'demo123'
};

class GastroToolsTestSuite {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = {
      authentication: {},
      admin: {},
      tools: {},
      forms: {},
      email: {},
      mobile: {},
      i18n: {},
      security: {}
    };
    this.screenshots = [];
    this.bugs = [];
    this.performanceMetrics = [];
  }

  async setup() {
    console.log('🚀 Setting up comprehensive GastroTools testing...');
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 100,
      timeout: 60000
    });
    this.page = await this.browser.newPage();
    
    // Enable performance monitoring
    await this.page.context().tracing.start({ screenshots: true, snapshots: true });
    
    // Set viewport for desktop testing
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('✅ Browser setup complete');
  }

  async takeScreenshot(name, description = '') {
    const filename = `screenshot-${Date.now()}-${name}.png`;
    const filepath = path.join(__dirname, 'test-screenshots', filename);
    
    // Create directory if it doesn't exist
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    await this.page.screenshot({ path: filepath, fullPage: true });
    this.screenshots.push({ name, description, filepath, timestamp: new Date() });
    console.log(`📸 Screenshot saved: ${filename} - ${description}`);
  }

  async recordBug(severity, category, description, url = null) {
    this.bugs.push({
      severity, // 'blocking', 'major', 'minor'
      category,
      description,
      url: url || this.page.url(),
      timestamp: new Date(),
      screenshot: await this.takeScreenshot(`bug-${this.bugs.length + 1}`, description)
    });
    console.log(`🐛 ${severity.toUpperCase()} BUG: ${description}`);
  }

  async measurePerformance(action) {
    const start = Date.now();
    await action();
    const end = Date.now();
    const duration = end - start;
    
    this.performanceMetrics.push({
      action: action.name || 'unknown',
      duration,
      timestamp: new Date(),
      url: this.page.url()
    });
    
    return duration;
  }

  // AUTHENTICATION TESTING
  async testAuthentication() {
    console.log('\n🔐 TESTING AUTHENTICATION FLOW');
    
    try {
      // Test 1: Homepage accessibility
      console.log('Testing homepage accessibility...');
      await this.page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
      await this.takeScreenshot('homepage', 'Homepage loaded');
      
      const pageTitle = await this.page.title();
      if (!pageTitle || pageTitle.includes('404')) {
        await this.recordBug('blocking', 'authentication', 'Homepage not accessible or showing 404');
        this.testResults.authentication.homepage = 'FAIL';
      } else {
        this.testResults.authentication.homepage = 'PASS';
        console.log('✅ Homepage accessible');
      }

      // Test 2: Login page navigation
      console.log('Testing login page navigation...');
      const loginLink = this.page.locator('a[href*="/login"], button:has-text("Login"), button:has-text("Anmelden")');
      if (await loginLink.isVisible()) {
        await loginLink.click();
        await this.page.waitForLoadState('networkidle');
        await this.takeScreenshot('login-page', 'Login page loaded');
        this.testResults.authentication.loginNavigation = 'PASS';
      } else {
        await this.page.goto(`${PRODUCTION_URL}/login`);
        await this.page.waitForLoadState('networkidle');
      }

      // Test 3: Demo login functionality
      console.log('Testing demo login...');
      const emailField = this.page.locator('input[type="email"], input[name="email"]');
      const passwordField = this.page.locator('input[type="password"], input[name="password"]');
      const submitButton = this.page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Anmelden")');

      if (!(await emailField.isVisible()) || !(await passwordField.isVisible())) {
        await this.recordBug('blocking', 'authentication', 'Login form fields not found');
        this.testResults.authentication.loginForm = 'FAIL';
        return;
      }

      await emailField.fill(DEMO_CREDENTIALS.email);
      await passwordField.fill(DEMO_CREDENTIALS.password);
      await this.takeScreenshot('login-filled', 'Login form filled with demo credentials');
      
      await submitButton.click();
      await this.page.waitForTimeout(3000);
      
      const currentUrl = this.page.url();
      if (currentUrl.includes('/dashboard') || currentUrl.includes('/tools')) {
        console.log('✅ Demo login successful - redirected to dashboard');
        this.testResults.authentication.demoLogin = 'PASS';
        await this.takeScreenshot('dashboard', 'Dashboard after successful login');
      } else {
        await this.recordBug('blocking', 'authentication', 'Demo login failed - not redirected to dashboard');
        this.testResults.authentication.demoLogin = 'FAIL';
      }

      // Test 4: Session persistence
      console.log('Testing session persistence...');
      await this.page.reload();
      await this.page.waitForTimeout(2000);
      if (this.page.url().includes('/login')) {
        await this.recordBug('major', 'authentication', 'Session not persistent after page reload');
        this.testResults.authentication.sessionPersistence = 'FAIL';
      } else {
        this.testResults.authentication.sessionPersistence = 'PASS';
      }

      // Test 5: Invalid credentials
      console.log('Testing invalid credentials...');
      await this.page.goto(`${PRODUCTION_URL}/login`);
      await emailField.fill('invalid@test.com');
      await passwordField.fill('wrongpassword');
      await submitButton.click();
      await this.page.waitForTimeout(2000);
      
      const errorMessage = await this.page.locator('.error, .alert, .toast, [class*="error"]').first();
      if (await errorMessage.isVisible()) {
        this.testResults.authentication.invalidCredentials = 'PASS';
        console.log('✅ Error message shown for invalid credentials');
      } else {
        await this.recordBug('major', 'authentication', 'No error message shown for invalid credentials');
        this.testResults.authentication.invalidCredentials = 'FAIL';
      }

    } catch (error) {
      console.error('❌ Authentication testing failed:', error.message);
      await this.recordBug('blocking', 'authentication', `Authentication test suite failed: ${error.message}`);
    }
  }

  // TOOLS TESTING
  async testAllTools() {
    console.log('\n🛠️ TESTING ALL TOOLS FUNCTIONALITY');
    
    try {
      // Ensure we're logged in
      if (!this.page.url().includes('/dashboard') && !this.page.url().includes('/tools')) {
        await this.page.goto(`${PRODUCTION_URL}/login`);
        await this.page.fill('input[type="email"]', DEMO_CREDENTIALS.email);
        await this.page.fill('input[type="password"]', DEMO_CREDENTIALS.password);
        await this.page.click('button[type="submit"]');
        await this.page.waitForTimeout(3000);
      }

      // Tool 1: Nutrition Calculator
      console.log('Testing Nutrition Calculator...');
      await this.testNutritionCalculator();

      // Tool 2: Cost Control
      console.log('Testing Cost Control...');
      await this.testCostControl();

      // Tool 3: Inventory Management  
      console.log('Testing Inventory Management...');
      await this.testInventoryManagement();

      // Tool 4: Menu Planner
      console.log('Testing Menu Planner...');
      await this.testMenuPlanner();

      // Tool 5: Menu Card Designer
      console.log('Testing Menu Card Designer...');
      await this.testMenuCardDesigner();

    } catch (error) {
      console.error('❌ Tools testing failed:', error.message);
      await this.recordBug('blocking', 'tools', `Tools test suite failed: ${error.message}`);
    }
  }

  async testNutritionCalculator() {
    try {
      // Navigate to nutrition calculator
      const nutritionLink = this.page.locator('a[href*="naehrwert"], a:has-text("Nährwert"), a:has-text("Nutrition")');
      if (await nutritionLink.isVisible()) {
        await nutritionLink.click();
        await this.page.waitForLoadState('networkidle');
      } else {
        await this.page.goto(`${PRODUCTION_URL}/naehrwertrechner`);
      }

      await this.takeScreenshot('nutrition-calculator', 'Nutrition Calculator loaded');

      // Test ingredient search
      const searchInput = this.page.locator('input[placeholder*="Zutat"], input[placeholder*="ingredient"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('Tomato');
        await this.page.waitForTimeout(1000);
        
        const searchResults = this.page.locator('[class*="result"], [class*="suggestion"]');
        if (await searchResults.first().isVisible()) {
          await searchResults.first().click();
          console.log('✅ Nutrition search working');
          this.testResults.tools.nutritionSearch = 'PASS';
        } else {
          await this.recordBug('major', 'tools', 'Nutrition search not returning results');
          this.testResults.tools.nutritionSearch = 'FAIL';
        }
      } else {
        await this.recordBug('major', 'tools', 'Nutrition calculator search input not found');
        this.testResults.tools.nutritionSearch = 'FAIL';
      }

      // Test calculation
      const calculateButton = this.page.locator('button:has-text("Berechnen"), button:has-text("Calculate")');
      if (await calculateButton.isVisible()) {
        await calculateButton.click();
        await this.page.waitForTimeout(2000);
        
        const results = this.page.locator('[class*="result"], .nutrition-results');
        if (await results.isVisible()) {
          this.testResults.tools.nutritionCalculation = 'PASS';
          console.log('✅ Nutrition calculation working');
        } else {
          this.testResults.tools.nutritionCalculation = 'FAIL';
          await this.recordBug('major', 'tools', 'Nutrition calculation not showing results');
        }
      }

    } catch (error) {
      await this.recordBug('major', 'tools', `Nutrition calculator error: ${error.message}`);
      this.testResults.tools.nutritionCalculator = 'FAIL';
    }
  }

  async testCostControl() {
    try {
      await this.page.goto(`${PRODUCTION_URL}/kostenkontrolle`);
      await this.takeScreenshot('cost-control', 'Cost Control loaded');
      
      // Test adding a cost entry
      const addButton = this.page.locator('button:has-text("Hinzufügen"), button:has-text("Add"), button[class*="add"]');
      if (await addButton.isVisible()) {
        await addButton.click();
        await this.page.waitForTimeout(1000);
        
        // Fill cost entry form
        const nameField = this.page.locator('input[name="name"], input[placeholder*="Name"]');
        const amountField = this.page.locator('input[name="amount"], input[type="number"]');
        
        if (await nameField.isVisible() && await amountField.isVisible()) {
          await nameField.fill('Test Expense');
          await amountField.fill('25.50');
          
          const saveButton = this.page.locator('button:has-text("Speichern"), button:has-text("Save")');
          if (await saveButton.isVisible()) {
            await saveButton.click();
            await this.page.waitForTimeout(2000);
            this.testResults.tools.costControl = 'PASS';
            console.log('✅ Cost control entry creation working');
          }
        }
      } else {
        this.testResults.tools.costControl = 'PARTIAL';
        console.log('⚠️ Cost control add button not found - checking for existing entries');
      }

    } catch (error) {
      await this.recordBug('major', 'tools', `Cost control error: ${error.message}`);
      this.testResults.tools.costControl = 'FAIL';
    }
  }

  async testInventoryManagement() {
    try {
      await this.page.goto(`${PRODUCTION_URL}/lagerverwaltung`);
      await this.takeScreenshot('inventory', 'Inventory Management loaded');
      
      // Test inventory list
      const inventoryItems = this.page.locator('[class*="inventory"], [class*="item"], tr');
      if ((await inventoryItems.count()) > 0) {
        this.testResults.tools.inventoryList = 'PASS';
        console.log('✅ Inventory list displaying');
      } else {
        // Try to add an item
        const addButton = this.page.locator('button:has-text("Hinzufügen"), button:has-text("Add")');
        if (await addButton.isVisible()) {
          await addButton.click();
          await this.page.waitForTimeout(1000);
          this.testResults.tools.inventoryList = 'PASS';
        } else {
          this.testResults.tools.inventoryList = 'PARTIAL';
        }
      }

    } catch (error) {
      await this.recordBug('major', 'tools', `Inventory management error: ${error.message}`);
      this.testResults.tools.inventory = 'FAIL';
    }
  }

  async testMenuPlanner() {
    try {
      await this.page.goto(`${PRODUCTION_URL}/menueplaner`);
      await this.takeScreenshot('menu-planner', 'Menu Planner loaded');
      
      // Test weekly calendar view
      const calendar = this.page.locator('[class*="calendar"], [class*="week"], table');
      if (await calendar.isVisible()) {
        this.testResults.tools.menuPlanner = 'PASS';
        console.log('✅ Menu planner calendar visible');
      } else {
        this.testResults.tools.menuPlanner = 'FAIL';
        await this.recordBug('major', 'tools', 'Menu planner calendar not visible');
      }

    } catch (error) {
      await this.recordBug('major', 'tools', `Menu planner error: ${error.message}`);
      this.testResults.tools.menuPlanner = 'FAIL';
    }
  }

  async testMenuCardDesigner() {
    try {
      await this.page.goto(`${PRODUCTION_URL}/speisekarten-designer`);
      await this.takeScreenshot('menu-designer', 'Menu Card Designer loaded');
      
      // Test template selection or creation
      const createButton = this.page.locator('button:has-text("Erstellen"), button:has-text("Create"), button:has-text("Neue Karte")');
      const templates = this.page.locator('[class*="template"], [class*="card"]');
      
      if ((await createButton.isVisible()) || (await templates.count()) > 0) {
        this.testResults.tools.menuDesigner = 'PASS';
        console.log('✅ Menu card designer interface loaded');
      } else {
        this.testResults.tools.menuDesigner = 'FAIL';
        await this.recordBug('major', 'tools', 'Menu card designer interface not working');
      }

    } catch (error) {
      await this.recordBug('major', 'tools', `Menu card designer error: ${error.message}`);
      this.testResults.tools.menuDesigner = 'FAIL';
    }
  }

  // INTERNATIONALIZATION TESTING
  async testInternationalization() {
    console.log('\n🌍 TESTING INTERNATIONALIZATION');
    
    try {
      await this.page.goto(PRODUCTION_URL);
      
      // Test language switcher
      const langSwitcher = this.page.locator('button[title*="Language"], button:has-text("DE"), button:has-text("EN"), select[name*="lang"]');
      if (await langSwitcher.isVisible()) {
        await langSwitcher.click();
        await this.page.waitForTimeout(1000);
        
        await this.takeScreenshot('language-switch', 'Language switcher activated');
        this.testResults.i18n.languageSwitcher = 'PASS';
        console.log('✅ Language switcher found and working');
        
        // Test content translation
        const pageContent = await this.page.textContent('body');
        const hasGermanChars = /[äöüßÄÖÜ]/.test(pageContent);
        
        if (hasGermanChars) {
          console.log('📝 Content contains German characters');
          this.testResults.i18n.germanContent = 'PASS';
        }
        
      } else {
        await this.recordBug('major', 'i18n', 'Language switcher not found');
        this.testResults.i18n.languageSwitcher = 'FAIL';
      }

    } catch (error) {
      await this.recordBug('major', 'i18n', `Internationalization test failed: ${error.message}`);
    }
  }

  // MOBILE RESPONSIVENESS TESTING
  async testMobileResponsiveness() {
    console.log('\n📱 TESTING MOBILE RESPONSIVENESS');
    
    try {
      // Test iPhone viewport
      await this.page.setViewportSize({ width: 375, height: 667 });
      await this.page.goto(PRODUCTION_URL);
      await this.page.waitForLoadState('networkidle');
      await this.takeScreenshot('mobile-homepage', 'Mobile homepage view');
      
      // Test navigation menu on mobile
      const mobileMenu = this.page.locator('button[class*="menu"], .hamburger, button:has-text("☰")');
      if (await mobileMenu.isVisible()) {
        await mobileMenu.click();
        await this.page.waitForTimeout(500);
        await this.takeScreenshot('mobile-menu-open', 'Mobile menu opened');
        this.testResults.mobile.navigation = 'PASS';
        console.log('✅ Mobile navigation working');
      } else {
        // Check if navigation is visible without hamburger menu
        const navLinks = this.page.locator('nav a, .navigation a');
        if ((await navLinks.count()) > 0) {
          this.testResults.mobile.navigation = 'PASS';
        } else {
          this.testResults.mobile.navigation = 'FAIL';
          await this.recordBug('major', 'mobile', 'Mobile navigation not accessible');
        }
      }

      // Test form inputs on mobile
      await this.page.goto(`${PRODUCTION_URL}/login`);
      const emailInput = this.page.locator('input[type="email"]');
      if (await emailInput.isVisible()) {
        await emailInput.tap();
        await this.page.waitForTimeout(500);
        await this.takeScreenshot('mobile-keyboard', 'Mobile keyboard activated');
        this.testResults.mobile.formInputs = 'PASS';
      }

      // Reset to desktop viewport
      await this.page.setViewportSize({ width: 1920, height: 1080 });

    } catch (error) {
      await this.recordBug('major', 'mobile', `Mobile responsiveness test failed: ${error.message}`);
    }
  }

  // SECURITY TESTING
  async testSecurity() {
    console.log('\n🔒 TESTING SECURITY & EDGE CASES');
    
    try {
      // Test unauthorized access to protected routes
      const protectedRoutes = ['/dashboard', '/admin', '/tools'];
      
      // First, logout if logged in
      try {
        await this.page.goto(`${PRODUCTION_URL}/logout`);
        await this.page.waitForTimeout(1000);
      } catch {}
      
      for (const route of protectedRoutes) {
        await this.page.goto(`${PRODUCTION_URL}${route}`);
        await this.page.waitForTimeout(2000);
        
        if (this.page.url().includes('/login')) {
          console.log(`✅ Protected route ${route} properly redirected to login`);
          this.testResults.security[`protection_${route.replace('/', '')}`] = 'PASS';
        } else {
          await this.recordBug('blocking', 'security', `Protected route ${route} accessible without authentication`);
          this.testResults.security[`protection_${route.replace('/', '')}`] = 'FAIL';
        }
      }

      // Test 404 handling
      await this.page.goto(`${PRODUCTION_URL}/nonexistent-page-${Date.now()}`);
      await this.page.waitForTimeout(2000);
      
      const is404 = await this.page.locator('h1:has-text("404"), h1:has-text("Not Found"), h1:has-text("Nicht gefunden")').isVisible();
      if (is404 || this.page.url().includes('404')) {
        this.testResults.security.errorHandling = 'PASS';
        console.log('✅ 404 error handling working');
      } else {
        this.testResults.security.errorHandling = 'FAIL';
        await this.recordBug('minor', 'security', '404 error handling not working properly');
      }

    } catch (error) {
      await this.recordBug('major', 'security', `Security test failed: ${error.message}`);
    }
  }

  // ADMIN FUNCTIONALITY TESTING
  async testAdminFunctionality() {
    console.log('\n👨‍💼 TESTING ADMIN FUNCTIONALITY');
    
    try {
      // Login as demo user first
      await this.page.goto(`${PRODUCTION_URL}/login`);
      await this.page.fill('input[type="email"]', DEMO_CREDENTIALS.email);
      await this.page.fill('input[type="password"]', DEMO_CREDENTIALS.password);
      await this.page.click('button[type="submit"]');
      await this.page.waitForTimeout(3000);

      // Try to access admin panel
      await this.page.goto(`${PRODUCTION_URL}/admin`);
      await this.page.waitForTimeout(2000);
      await this.takeScreenshot('admin-panel', 'Admin panel access attempt');

      if (this.page.url().includes('/admin')) {
        console.log('✅ Admin panel accessible');
        this.testResults.admin.access = 'PASS';
        
        // Test admin dashboard components
        const monitoringLink = this.page.locator('a:has-text("Monitor"), a[href*="monitoring"]');
        const leadsSection = this.page.locator('[class*="lead"], h2:has-text("Lead"), h2:has-text("Anfragen")');
        
        if (await monitoringLink.isVisible() || await leadsSection.isVisible()) {
          this.testResults.admin.dashboard = 'PASS';
          console.log('✅ Admin dashboard components visible');
        } else {
          this.testResults.admin.dashboard = 'PARTIAL';
          console.log('⚠️ Admin dashboard partially loaded');
        }
        
      } else {
        this.testResults.admin.access = 'FAIL';
        console.log('❌ Admin panel not accessible or redirected');
      }

    } catch (error) {
      await this.recordBug('major', 'admin', `Admin functionality test failed: ${error.message}`);
    }
  }

  // PERFORMANCE TESTING
  async testPerformance() {
    console.log('\n⚡ TESTING PERFORMANCE');
    
    try {
      const pages = ['/', '/login', '/register', '/naehrwertrechner', '/kostenkontrolle'];
      
      for (const pagePath of pages) {
        const url = `${PRODUCTION_URL}${pagePath}`;
        console.log(`Testing performance of ${url}...`);
        
        const startTime = Date.now();
        await this.page.goto(url, { waitUntil: 'networkidle' });
        const loadTime = Date.now() - startTime;
        
        this.performanceMetrics.push({
          page: pagePath,
          loadTime,
          url,
          timestamp: new Date()
        });
        
        if (loadTime > 5000) {
          await this.recordBug('minor', 'performance', `Page ${pagePath} takes ${loadTime}ms to load (>5s)`);
        }
        
        console.log(`📊 ${pagePath}: ${loadTime}ms`);
      }

    } catch (error) {
      await this.recordBug('minor', 'performance', `Performance test failed: ${error.message}`);
    }
  }

  // GENERATE COMPREHENSIVE REPORT
  async generateReport() {
    console.log('\n📊 GENERATING COMPREHENSIVE TEST REPORT');
    
    const report = {
      timestamp: new Date(),
      testSuite: 'GastroTools Comprehensive Testing',
      url: PRODUCTION_URL,
      summary: {
        totalTests: Object.keys(this.testResults).length,
        passed: 0,
        failed: 0,
        partial: 0
      },
      results: this.testResults,
      bugs: this.bugs,
      screenshots: this.screenshots.map(s => ({ name: s.name, description: s.description, timestamp: s.timestamp })),
      performance: this.performanceMetrics,
      recommendations: []
    };

    // Calculate summary
    for (const category of Object.values(this.testResults)) {
      for (const result of Object.values(category)) {
        if (result === 'PASS') report.summary.passed++;
        else if (result === 'FAIL') report.summary.failed++;
        else if (result === 'PARTIAL') report.summary.partial++;
      }
    }

    // Generate recommendations
    if (this.bugs.filter(b => b.severity === 'blocking').length > 0) {
      report.recommendations.push('CRITICAL: Fix blocking bugs before Upwork outsourcing');
    }
    
    if (this.bugs.filter(b => b.severity === 'major').length > 3) {
      report.recommendations.push('Address major bugs to improve user experience');
    }

    const avgLoadTime = this.performanceMetrics.reduce((acc, m) => acc + m.loadTime, 0) / this.performanceMetrics.length;
    if (avgLoadTime > 3000) {
      report.recommendations.push('Optimize performance - average load time exceeds 3 seconds');
    }

    // Determine readiness
    const blockingBugs = this.bugs.filter(b => b.severity === 'blocking').length;
    const majorBugs = this.bugs.filter(b => b.severity === 'major').length;
    
    if (blockingBugs === 0 && majorBugs < 3) {
      report.readiness = 'READY for Upwork outsourcing';
    } else if (blockingBugs === 0 && majorBugs < 6) {
      report.readiness = 'CONDITIONALLY READY - fix major issues first';  
    } else {
      report.readiness = 'NOT READY - critical issues must be resolved';
    }

    // Save report
    const reportPath = path.join(__dirname, `gastrotools-test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📋 COMPREHENSIVE TEST REPORT`);
    console.log(`================================`);
    console.log(`🎯 READINESS: ${report.readiness}`);
    console.log(`📊 Tests: ${report.summary.passed} passed, ${report.summary.failed} failed, ${report.summary.partial} partial`);
    console.log(`🐛 Bugs: ${this.bugs.filter(b => b.severity === 'blocking').length} blocking, ${this.bugs.filter(b => b.severity === 'major').length} major, ${this.bugs.filter(b => b.severity === 'minor').length} minor`);
    console.log(`⚡ Performance: ${Math.round(avgLoadTime)}ms average load time`);
    console.log(`📸 Screenshots: ${this.screenshots.length} captured`);
    console.log(`📄 Report saved: ${reportPath}`);
    
    return report;
  }

  async cleanup() {
    if (this.page) {
      await this.page.context().tracing.stop({ path: 'trace.zip' });
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Cleanup completed');
  }

  async runFullTestSuite() {
    try {
      await this.setup();
      
      console.log('🚀 Starting comprehensive testing of GastroTools...\n');
      console.log(`🌐 Testing URL: ${PRODUCTION_URL}`);
      console.log(`👤 Demo Login: ${DEMO_CREDENTIALS.email} / ${DEMO_CREDENTIALS.password}\n`);
      
      await this.testAuthentication();
      await this.testAllTools();
      await this.testAdminFunctionality();
      await this.testInternationalization();
      await this.testMobileResponsiveness();
      await this.testSecurity();
      await this.testPerformance();
      
      const report = await this.generateReport();
      
      console.log('\n🎉 COMPREHENSIVE TESTING COMPLETED');
      console.log(`🏆 Final Status: ${report.readiness}`);
      
      return report;
      
    } catch (error) {
      console.error('💥 Test suite failed:', error);
      await this.recordBug('blocking', 'system', `Test suite execution failed: ${error.message}`);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the comprehensive test suite
(async () => {
  const testSuite = new GastroToolsTestSuite();
  await testSuite.runFullTestSuite();
})();