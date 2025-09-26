const { test, expect } = require('@playwright/test');

test.describe('Speisekarten Designer', () => {
  test('should load and function correctly', async ({ page }) => {
    // Start at homepage
    await page.goto('http://localhost:3000');

    // Click on Speisekarten Designer
    await page.click('text=Speisekarten Designer');

    // Wait for navigation
    await page.waitForURL('**/speisekarten-designer');

    // Check if main elements are present
    await expect(page.locator('h1:has-text("Speisekarten Designer")')).toBeVisible();

    // Check menu sections
    await expect(page.locator('h3:has-text("Vorspeisen")')).toBeVisible();
    await expect(page.locator('h3:has-text("Hauptgerichte")')).toBeVisible();
    await expect(page.locator('h3:has-text("Desserts")')).toBeVisible();
    await expect(page.locator('h3:has-text("Getränke")')).toBeVisible();

    // Test adding a dish
    const addButton = page.locator('button:has-text("Gericht hinzufügen")').first();
    await addButton.click();

    // Fill form
    await page.fill('input[name="name"]', 'Testgericht');
    await page.fill('textarea[name="description"]', 'Test Beschreibung');
    await page.fill('input[name="price"]', '12.50');

    // Save
    await page.click('button:has-text("Hinzufügen")');

    // Check if item was added
    await expect(page.locator('text=Testgericht')).toBeVisible();

    // Test PDF export
    await page.click('button:has-text("PDF exportieren")');

    // Take screenshot
    await page.screenshot({ path: 'speisekarten-designer-test.png', fullPage: true });
  });
});