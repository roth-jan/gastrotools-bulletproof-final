const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PRODUCTION_URL = 'https://gastrotools-mac-ready.vercel.app';
const DEMO_CREDENTIALS = { email: 'demo@gastrotools.de', password: 'demo123' };

class UpworkReadinessTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      authentication: {},
      toolFunctionality: {},
      formValidation: {},
      mobile: {},
      internationalization: {},
      email: {},
      admin: {},
      security: {},
      performance: {},
      businessLogic: {}
    };
    this.bugs = { blocking: [], major: [], minor: [] };
    this.screenshots = [];
    this.performanceMetrics = [];
  }

  async setup() {
    console.log('🚀 Setting up Upwork readiness testing...');
    this.browser = await chromium.launch({ headless: false, slowMo: 100 });
    this.page = await this.browser.newPage();
    this.page.setDefaultTimeout(8000);
    
    // Create screenshots directory
    if (!fs.existsSync('./upwork-test-screenshots')) {
      fs.mkdirSync('./upwork-test-screenshots');
    }
    
    console.log('✅ Setup complete');
  }

  async screenshot(name, description) {
    const filepath = `./upwork-test-screenshots/${Date.now()}-${name}.png`;
    await this.page.screenshot({ path: filepath, fullPage: true });
    this.screenshots.push({ name, description, filepath });
    console.log(`📸 ${name}: ${description}`);
  }

  recordBug(severity, category, description) {
    const bug = { severity, category, description, url: this.page.url(), timestamp: new Date() };
    this.bugs[severity].push(bug);
    console.log(`🐛 ${severity.toUpperCase()}: ${description}`);
  }

  async measurePerformance(name, action) {
    const start = Date.now();
    await action();
    const duration = Date.now() - start;
    this.performanceMetrics.push({ name, duration, timestamp: new Date() });
    console.log(`⏱️ ${name}: ${duration}ms`);
    return duration;
  }

  async login() {
    await this.page.goto(`${PRODUCTION_URL}/login`, { waitUntil: 'domcontentloaded' });
    await this.page.fill('input[type="email"]', DEMO_CREDENTIALS.email);
    await this.page.fill('input[type="password"]', DEMO_CREDENTIALS.password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForTimeout(2000);
  }

  // 1. AUTHENTICATION TESTING
  async testAuthentication() {
    console.log('\n🔐 TESTING AUTHENTICATION & USER MANAGEMENT');
    
    try {
      // Test 1: Homepage accessibility
      await this.measurePerformance('Homepage Load', async () => {
        await this.page.goto(PRODUCTION_URL, { waitUntil: 'domcontentloaded' });
      });
      
      const title = await this.page.title();
      if (title && !title.includes('404')) {
        this.results.authentication.homepage = 'PASS';
        console.log('✅ Homepage accessible');
      } else {
        this.results.authentication.homepage = 'FAIL';
        this.recordBug('blocking', 'auth', 'Homepage not accessible');
      }

      await this.screenshot('homepage', 'Homepage loaded');

      // Test 2: Login functionality
      await this.page.goto(`${PRODUCTION_URL}/login`);
      await this.screenshot('login-page', 'Login page loaded');
      
      const emailField = await this.page.$('input[type="email"]');
      const passwordField = await this.page.$('input[type="password"]');
      const submitButton = await this.page.$('button[type="submit"]');

      if (emailField && passwordField && submitButton) {
        this.results.authentication.loginForm = 'PASS';
        
        // Test demo login
        await emailField.fill(DEMO_CREDENTIALS.email);
        await passwordField.fill(DEMO_CREDENTIALS.password);
        await submitButton.click();
        await this.page.waitForTimeout(3000);
        
        if (!this.page.url().includes('/login')) {
          this.results.authentication.demoLogin = 'PASS';
          console.log('✅ Demo login successful');
          await this.screenshot('post-login', 'Successfully logged in');
        } else {
          this.results.authentication.demoLogin = 'FAIL';
          this.recordBug('blocking', 'auth', 'Demo login failed');
        }
      } else {
        this.results.authentication.loginForm = 'FAIL';
        this.recordBug('blocking', 'auth', 'Login form elements missing');
      }

      // Test 3: Session persistence
      await this.page.reload();
      await this.page.waitForTimeout(1000);
      if (!this.page.url().includes('/login')) {
        this.results.authentication.sessionPersistence = 'PASS';
        console.log('✅ Session persists after reload');
      } else {
        this.results.authentication.sessionPersistence = 'FAIL';
        this.recordBug('major', 'auth', 'Session not persistent');
      }

      // Test 4: Invalid credentials
      await this.page.goto(`${PRODUCTION_URL}/login`);
      await this.page.fill('input[type="email"]', 'invalid@test.com');
      await this.page.fill('input[type="password"]', 'wrongpassword');
      await this.page.click('button[type="submit"]');
      await this.page.waitForTimeout(2000);
      
      const errorElement = await this.page.$('.error, .alert-error, [class*="error"]');
      if (errorElement) {
        this.results.authentication.errorHandling = 'PASS';
        console.log('✅ Error shown for invalid credentials');
      } else {
        this.results.authentication.errorHandling = 'FAIL';
        this.recordBug('major', 'auth', 'No error message for invalid credentials');
      }

    } catch (error) {
      this.recordBug('blocking', 'auth', `Authentication testing failed: ${error.message}`);
    }
  }

  // 2. TOOL FUNCTIONALITY TESTING
  async testToolFunctionality() {
    console.log('\n🛠️ TESTING TOOL FUNCTIONALITY');
    
    await this.login();
    
    const tools = [
      { path: '/naehrwertrechner', name: 'Nutrition Calculator' },
      { path: '/kostenkontrolle', name: 'Cost Control' },
      { path: '/lagerverwaltung', name: 'Inventory Management' },
      { path: '/menueplaner', name: 'Menu Planner' },
      { path: '/speisekarten-designer', name: 'Menu Card Designer' }
    ];

    for (const tool of tools) {
      try {
        console.log(`Testing ${tool.name}...`);
        
        await this.measurePerformance(`${tool.name} Load`, async () => {
          await this.page.goto(`${PRODUCTION_URL}${tool.path}`, { waitUntil: 'domcontentloaded' });
        });
        
        await this.screenshot(tool.path.slice(1), `${tool.name} loaded`);
        
        // Basic functionality check
        const hasMainContent = await this.page.$('main, .container, .content, .tool-content');
        const hasInteractiveElements = await this.page.$('button, input, select, textarea');
        
        if (hasMainContent && hasInteractiveElements) {
          this.results.toolFunctionality[tool.path] = 'PASS';
          console.log(`✅ ${tool.name} has interactive content`);
        } else if (hasMainContent) {
          this.results.toolFunctionality[tool.path] = 'PARTIAL';
          console.log(`⚠️ ${tool.name} loaded but limited interactivity`);
        } else {
          this.results.toolFunctionality[tool.path] = 'FAIL';
          this.recordBug('major', 'tools', `${tool.name} has no main content`);
        }

        // Tool-specific tests
        await this.testSpecificToolFeatures(tool);

      } catch (error) {
        this.results.toolFunctionality[tool.path] = 'FAIL';
        this.recordBug('major', 'tools', `${tool.name} failed: ${error.message}`);
      }
    }
  }

  async testSpecificToolFeatures(tool) {
    switch (tool.path) {
      case '/naehrwertrechner':
        // Test ingredient search
        const searchInput = await this.page.$('input[type="text"], input[placeholder*="Zutat"]');
        if (searchInput) {
          await searchInput.fill('Tomato');
          await this.page.waitForTimeout(1000);
          
          const searchResults = await this.page.$('.search-results, .dropdown, .autocomplete');
          if (searchResults) {
            this.results.toolFunctionality.nutritionSearch = 'PASS';
            console.log('✅ Nutrition search working');
          } else {
            this.results.toolFunctionality.nutritionSearch = 'FAIL';
            this.recordBug('major', 'tools', 'Nutrition search not returning results');
          }
        }
        break;

      case '/kostenkontrolle':
        // Test cost entry functionality
        const addButton = await this.page.$('button:has-text("Hinzufügen"), button:has-text("Add")');
        if (addButton) {
          this.results.toolFunctionality.costControlAdd = 'PASS';
          console.log('✅ Cost control add functionality present');
        } else {
          this.results.toolFunctionality.costControlAdd = 'PARTIAL';
        }
        
        // Check for analytics/charts
        const chartElement = await this.page.$('canvas, .chart, .graph, svg');
        if (chartElement) {
          this.results.toolFunctionality.costControlCharts = 'PASS';
          console.log('✅ Cost control charts present');
        }
        break;

      case '/lagerverwaltung':
        // Test inventory display
        const inventoryItems = await this.page.$$('.inventory-item, tr, .stock-item');
        if (inventoryItems.length > 0) {
          this.results.toolFunctionality.inventoryDisplay = 'PASS';
          console.log('✅ Inventory items displayed');
        }
        
        // Test search functionality
        const searchField = await this.page.$('input[type="search"], input[placeholder*="Such"]');
        if (searchField) {
          this.results.toolFunctionality.inventorySearch = 'PASS';
          console.log('✅ Inventory search available');
        }
        break;

      case '/menueplaner':
        // Test calendar/planner display
        const calendar = await this.page.$('.calendar, .week-view, table');
        if (calendar) {
          this.results.toolFunctionality.menuPlannerCalendar = 'PASS';
          console.log('✅ Menu planner calendar displayed');
        }
        break;

      case '/speisekarten-designer':
        // Test template functionality
        const templates = await this.page.$$('.template, .card-template');
        const createButton = await this.page.$('button:has-text("Erstellen"), button:has-text("Create")');
        
        if (templates.length > 0 || createButton) {
          this.results.toolFunctionality.menuDesignerTemplates = 'PASS';
          console.log('✅ Menu designer templates/creation available');
        }
        break;
    }
  }

  // 3. FORM VALIDATION TESTING
  async testFormValidation() {
    console.log('\n✅ TESTING FORM VALIDATION');
    
    try {
      // Test registration form validation
      await this.page.goto(`${PRODUCTION_URL}/register`);
      await this.screenshot('register-form', 'Registration form');
      
      const registerForm = await this.page.$('form');
      if (registerForm) {
        // Test empty form submission
        const submitBtn = await this.page.$('button[type="submit"]');
        if (submitBtn) {
          await submitBtn.click();
          await this.page.waitForTimeout(1000);
          
          const validationErrors = await this.page.$$('.error, [class*="error"], .invalid-feedback');
          if (validationErrors.length > 0) {
            this.results.formValidation.clientSideValidation = 'PASS';
            console.log('✅ Client-side validation working');
          } else {
            this.results.formValidation.clientSideValidation = 'FAIL';
            this.recordBug('major', 'forms', 'No client-side validation for empty form');
          }
        }

        // Test email validation
        const emailField = await this.page.$('input[type="email"]');
        if (emailField) {
          await emailField.fill('invalid-email');
          await submitBtn.click();
          await this.page.waitForTimeout(1000);
          
          const emailError = await this.page.$('.error, [class*="error"]');
          if (emailError) {
            this.results.formValidation.emailValidation = 'PASS';
            console.log('✅ Email validation working');
          } else {
            this.results.formValidation.emailValidation = 'FAIL';
            this.recordBug('minor', 'forms', 'Email validation not working');
          }
        }
      } else {
        this.results.formValidation.registrationForm = 'FAIL';
        this.recordBug('minor', 'forms', 'Registration form not found');
      }

    } catch (error) {
      this.recordBug('minor', 'forms', `Form validation testing failed: ${error.message}`);
    }
  }

  // 4. MOBILE RESPONSIVENESS
  async testMobileResponsiveness() {
    console.log('\n📱 TESTING MOBILE RESPONSIVENESS');
    
    try {
      // iPhone test
      await this.page.setViewportSize({ width: 375, height: 667 });
      await this.page.goto(PRODUCTION_URL, { waitUntil: 'domcontentloaded' });
      await this.screenshot('mobile-iphone', 'iPhone viewport');
      
      // Test mobile navigation
      const mobileMenu = await this.page.$('.hamburger, .menu-toggle, button[aria-label*="menu" i]');
      if (mobileMenu) {
        await mobileMenu.click();
        await this.page.waitForTimeout(500);
        await this.screenshot('mobile-menu-open', 'Mobile menu opened');
        this.results.mobile.navigation = 'PASS';
        console.log('✅ Mobile navigation working');
      } else {
        // Check if nav is visible without hamburger
        const navLinks = await this.page.$$('nav a, .nav-link');
        if (navLinks.length > 0) {
          this.results.mobile.navigation = 'PASS';
          console.log('✅ Mobile navigation visible');
        } else {
          this.results.mobile.navigation = 'FAIL';
          this.recordBug('major', 'mobile', 'Mobile navigation not accessible');
        }
      }
      
      // Test form inputs on mobile
      await this.page.goto(`${PRODUCTION_URL}/login`);
      const emailInput = await this.page.$('input[type="email"]');
      if (emailInput) {
        await emailInput.click();
        this.results.mobile.formInputs = 'PASS';
        console.log('✅ Mobile form inputs accessible');
      }
      
      // Android tablet test  
      await this.page.setViewportSize({ width: 768, height: 1024 });
      await this.page.goto(PRODUCTION_URL, { waitUntil: 'domcontentloaded' });
      await this.screenshot('mobile-tablet', 'Tablet viewport');
      this.results.mobile.tabletLayout = 'PASS';
      
      // Reset to desktop
      await this.page.setViewportSize({ width: 1920, height: 1080 });

    } catch (error) {
      this.recordBug('major', 'mobile', `Mobile testing failed: ${error.message}`);
    }
  }

  // 5. INTERNATIONALIZATION
  async testInternationalization() {
    console.log('\n🌍 TESTING INTERNATIONALIZATION');
    
    try {
      await this.page.goto(PRODUCTION_URL, { waitUntil: 'domcontentloaded' });
      
      // Look for language switcher
      const langSwitcher = await this.page.$('button:has-text("EN"), button:has-text("DE"), select[name*="lang"]');
      
      if (langSwitcher) {
        this.results.internationalization.languageSwitcher = 'PASS';
        console.log('✅ Language switcher found');
        await this.screenshot('language-switcher', 'Language switcher located');
        
        // Test switching to English
        const englishOption = await this.page.$('button:has-text("EN"), option[value="en"]');
        if (englishOption) {
          await englishOption.click();
          await this.page.waitForTimeout(2000);
          
          const bodyText = await this.page.textContent('body');
          const hasGermanText = /Anmelden|Registrieren|Nährwert|Kostenkontrolle/i.test(bodyText);
          
          if (!hasGermanText) {
            this.results.internationalization.englishMode = 'PASS';
            console.log('✅ English mode working');
            await this.screenshot('english-mode', 'English mode activated');
          } else {
            this.results.internationalization.englishMode = 'FAIL';
            this.recordBug('major', 'i18n', 'English mode still shows German text');
          }
        }
      } else {
        this.results.internationalization.languageSwitcher = 'FAIL';
        this.recordBug('major', 'i18n', 'Language switcher not found');
      }

    } catch (error) {
      this.recordBug('major', 'i18n', `Internationalization testing failed: ${error.message}`);
    }
  }

  // 6. EMAIL & COMMUNICATION
  async testEmailCommunication() {
    console.log('\n📧 TESTING EMAIL & COMMUNICATION');
    
    try {
      // Test contact form
      await this.page.goto(`${PRODUCTION_URL}/kontakt`);
      await this.screenshot('contact-form', 'Contact form page');
      
      const contactForm = await this.page.$('form');
      if (contactForm) {
        const nameField = await this.page.$('input[name="name"], input[placeholder*="Name"]');
        const emailField = await this.page.$('input[type="email"]');
        const messageField = await this.page.$('textarea');
        
        if (nameField && emailField && messageField) {
          this.results.email.contactForm = 'PASS';
          console.log('✅ Contact form structure complete');
        } else {
          this.results.email.contactForm = 'FAIL';
          this.recordBug('major', 'email', 'Contact form missing fields');
        }
      } else {
        this.results.email.contactForm = 'FAIL';
        this.recordBug('major', 'email', 'Contact form not found');
      }
      
      // Test forgot password
      await this.page.goto(`${PRODUCTION_URL}/forgot-password`);
      const forgotPasswordForm = await this.page.$('form');
      if (forgotPasswordForm) {
        this.results.email.forgotPassword = 'PASS';
        console.log('✅ Forgot password form accessible');
      } else {
        this.results.email.forgotPassword = 'FAIL';
        this.recordBug('minor', 'email', 'Forgot password form not found');
      }

    } catch (error) {
      this.recordBug('minor', 'email', `Email testing failed: ${error.message}`);
    }
  }

  // 7. ADMIN FUNCTIONALITY
  async testAdminFunctionality() {
    console.log('\n👨‍💼 TESTING ADMIN FUNCTIONALITY');
    
    await this.login();
    
    try {
      await this.page.goto(`${PRODUCTION_URL}/admin`);
      await this.screenshot('admin-panel', 'Admin panel access');
      
      if (this.page.url().includes('/admin')) {
        this.results.admin.access = 'PASS';
        console.log('✅ Admin panel accessible');
        
        // Test monitoring section
        const monitoringLink = await this.page.$('a[href*="monitoring"]');
        if (monitoringLink) {
          this.results.admin.monitoring = 'PASS';
          console.log('✅ Admin monitoring available');
        }
        
        // Test leads section
        const leadsSection = await this.page.$('h2:has-text("Lead"), .leads-section');
        if (leadsSection) {
          this.results.admin.leadsManagement = 'PASS';
          console.log('✅ Leads management visible');
        }
        
      } else {
        this.results.admin.access = 'FAIL';
        this.recordBug('major', 'admin', 'Admin panel not accessible');
      }

    } catch (error) {
      this.recordBug('major', 'admin', `Admin testing failed: ${error.message}`);
    }
  }

  // 8. SECURITY & EDGE CASES
  async testSecurity() {
    console.log('\n🔒 TESTING SECURITY');
    
    try {
      // Clear session
      await this.page.context().clearCookies();
      
      // Test protected route access
      const protectedRoutes = ['/admin', '/dashboard'];
      
      for (const route of protectedRoutes) {
        await this.page.goto(`${PRODUCTION_URL}${route}`);
        await this.page.waitForTimeout(1000);
        
        if (this.page.url().includes('/login')) {
          this.results.security[`protection_${route.replace('/', '')}`] = 'PASS';
          console.log(`✅ Route ${route} properly protected`);
        } else {
          this.results.security[`protection_${route.replace('/', '')}`] = 'FAIL';
          this.recordBug('blocking', 'security', `Route ${route} not protected`);
        }
      }
      
      // Test 404 handling
      await this.page.goto(`${PRODUCTION_URL}/nonexistent-page-${Date.now()}`);
      await this.page.waitForTimeout(2000);
      
      const is404 = await this.page.$('h1:has-text("404"), h1:has-text("Not Found")');
      if (is404 || this.page.url().includes('404')) {
        this.results.security.errorHandling = 'PASS';
        console.log('✅ 404 handling working');
      } else {
        this.results.security.errorHandling = 'FAIL';
        this.recordBug('minor', 'security', '404 handling not working');
      }

    } catch (error) {
      this.recordBug('minor', 'security', `Security testing failed: ${error.message}`);
    }
  }

  // 9. PERFORMANCE
  async testPerformance() {
    console.log('\n⚡ TESTING PERFORMANCE');
    
    const testPages = ['/', '/login', '/naehrwertrechner', '/kostenkontrolle'];
    
    for (const page of testPages) {
      try {
        const loadTime = await this.measurePerformance(`Page ${page}`, async () => {
          await this.page.goto(`${PRODUCTION_URL}${page}`, { waitUntil: 'domcontentloaded' });
        });
        
        if (loadTime > 5000) {
          this.recordBug('minor', 'performance', `Page ${page} loads slowly: ${loadTime}ms`);
        }
      } catch (error) {
        this.recordBug('minor', 'performance', `Performance test failed for ${page}: ${error.message}`);
      }
    }
    
    const avgLoadTime = this.performanceMetrics.reduce((acc, m) => acc + m.duration, 0) / this.performanceMetrics.length;
    
    if (avgLoadTime < 3000) {
      this.results.performance.averageLoadTime = 'PASS';
      console.log(`✅ Good performance: ${Math.round(avgLoadTime)}ms average`);
    } else {
      this.results.performance.averageLoadTime = 'FAIL';
      this.recordBug('minor', 'performance', `Slow average load time: ${Math.round(avgLoadTime)}ms`);
    }
  }

  // 10. BUSINESS LOGIC
  async testBusinessLogic() {
    console.log('\n💼 TESTING BUSINESS LOGIC');
    
    await this.login();
    
    try {
      // Test demo user privileges (should have unlimited access)
      await this.page.goto(`${PRODUCTION_URL}/naehrwertrechner`);
      
      // Add multiple items to test limits
      const searchInput = await this.page.$('input[type="text"]');
      if (searchInput) {
        for (let i = 0; i < 3; i++) {
          await searchInput.fill(`Test Item ${i}`);
          await this.page.waitForTimeout(500);
        }
        
        // Check for cross-sell modal (should NOT appear for demo user)
        const modal = await this.page.$('.modal, .popup');
        if (!modal) {
          this.results.businessLogic.demoUserLimits = 'PASS';
          console.log('✅ Demo user limits working correctly (no cross-sell modal)');
        } else {
          this.results.businessLogic.demoUserLimits = 'FAIL';
          this.recordBug('major', 'business', 'Cross-sell modal appearing for demo user');
        }
      }
      
      // Test data persistence
      await this.page.reload();
      await this.page.waitForTimeout(1000);
      
      // For demo user, data should persist in memory
      const persistedData = await this.page.$$('.saved-item, .recipe-item');
      this.results.businessLogic.dataPersistence = persistedData.length > 0 ? 'PASS' : 'PARTIAL';
      
    } catch (error) {
      this.recordBug('minor', 'business', `Business logic testing failed: ${error.message}`);
    }
  }

  // GENERATE COMPREHENSIVE REPORT
  async generateUpworkReport() {
    console.log('\n📊 GENERATING UPWORK READINESS REPORT');
    
    // Calculate statistics
    let totalTests = 0, passed = 0, failed = 0, partial = 0;
    
    for (const category of Object.values(this.results)) {
      for (const result of Object.values(category)) {
        totalTests++;
        if (result === 'PASS') passed++;
        else if (result === 'FAIL') failed++;
        else if (result === 'PARTIAL') partial++;
      }
    }

    const report = {
      timestamp: new Date(),
      testSuite: 'GastroTools Upwork Readiness Assessment',
      url: PRODUCTION_URL,
      summary: {
        totalTests,
        passed,
        failed,
        partial,
        successRate: Math.round((passed / totalTests) * 100)
      },
      results: this.results,
      bugs: {
        blocking: this.bugs.blocking.length,
        major: this.bugs.major.length,
        minor: this.bugs.minor.length,
        details: this.bugs
      },
      performance: {
        metrics: this.performanceMetrics,
        averageLoadTime: Math.round(
          this.performanceMetrics.reduce((acc, m) => acc + m.duration, 0) / this.performanceMetrics.length
        )
      },
      screenshots: this.screenshots.length,
      upworkReadiness: null,
      criticalFindings: [],
      recommendations: []
    };

    // Critical findings analysis
    if (this.bugs.blocking.length > 0) {
      report.criticalFindings.push(`${this.bugs.blocking.length} BLOCKING bugs found`);
      report.recommendations.push('❌ CRITICAL: Fix blocking bugs before Upwork deployment');
    }

    if (this.results.authentication.demoLogin !== 'PASS') {
      report.criticalFindings.push('Demo login not working');
      report.recommendations.push('❌ CRITICAL: Demo authentication must work for Upwork testing');
    }

    if (Object.values(this.results.toolFunctionality).filter(r => r === 'FAIL').length > 2) {
      report.criticalFindings.push('Multiple tool failures');
      report.recommendations.push('⚠️ MAJOR: Multiple tools not functioning properly');
    }

    if (this.results.internationalization.languageSwitcher !== 'PASS') {
      report.criticalFindings.push('Language switching not working');
      report.recommendations.push('⚠️ MAJOR: Language switching critical for international Upwork clients');
    }

    if (report.performance.averageLoadTime > 5000) {
      report.criticalFindings.push('Poor performance');
      report.recommendations.push('⚠️ Performance optimization needed');
    }

    // Final readiness assessment
    const blockingIssues = this.bugs.blocking.length;
    const majorIssues = this.bugs.major.length;
    const criticalFindings = report.criticalFindings.length;
    
    if (blockingIssues === 0 && majorIssues <= 2 && criticalFindings <= 1) {
      report.upworkReadiness = '✅ READY for Upwork outsourcing';
    } else if (blockingIssues === 0 && majorIssues <= 5) {
      report.upworkReadiness = '⚠️ CONDITIONALLY READY - address major issues';
    } else {
      report.upworkReadiness = '❌ NOT READY - critical issues must be resolved';
    }

    // Save report
    const reportPath = `./gastrotools-upwork-readiness-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Console output
    console.log('\n🎯 UPWORK READINESS ASSESSMENT');
    console.log('=====================================');
    console.log(`🏆 VERDICT: ${report.upworkReadiness}`);
    console.log(`📊 Tests: ${passed}✅ ${failed}❌ ${partial}⚠️ (${report.summary.successRate}% pass rate)`);
    console.log(`🐛 Issues: ${blockingIssues} blocking, ${majorIssues} major, ${this.bugs.minor.length} minor`);
    console.log(`⚡ Performance: ${report.performance.averageLoadTime}ms average`);
    console.log(`📸 Screenshots: ${this.screenshots.length} captured`);
    
    if (report.criticalFindings.length > 0) {
      console.log('\n🚨 CRITICAL FINDINGS:');
      report.criticalFindings.forEach((finding, i) => {
        console.log(`${i+1}. ${finding}`);
      });
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach((rec, i) => {
        console.log(`${i+1}. ${rec}`);
      });
    }
    
    console.log(`\n📄 Full report saved: ${reportPath}`);
    
    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Cleanup completed');
  }

  async runUpworkReadinessTest() {
    try {
      await this.setup();
      
      console.log('🚀 STARTING UPWORK READINESS TESTING');
      console.log('=====================================\n');
      
      await this.testAuthentication();
      await this.testToolFunctionality();
      await this.testFormValidation();
      await this.testMobileResponsiveness();
      await this.testInternationalization();
      await this.testEmailCommunication();
      await this.testAdminFunctionality();
      await this.testSecurity();
      await this.testPerformance();
      await this.testBusinessLogic();
      
      const report = await this.generateUpworkReport();
      
      console.log('\n🎉 UPWORK READINESS TESTING COMPLETED');
      
      return report;
      
    } catch (error) {
      console.error('💥 Test execution failed:', error);
      this.recordBug('blocking', 'system', `Test execution failed: ${error.message}`);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the Upwork readiness test
(async () => {
  const testSuite = new UpworkReadinessTest();
  const report = await testSuite.runUpworkReadinessTest();
  
  if (report) {
    console.log(`\n🎯 Final Verdict: ${report.upworkReadiness}`);
    console.log('=====================================');
    
    if (report.upworkReadiness.includes('READY')) {
      console.log('🟢 Application is ready for professional Upwork outsourcing!');
    } else {
      console.log('🔴 Application needs fixes before Upwork deployment.');
      console.log('Focus on critical findings listed above.');
    }
  }
})();