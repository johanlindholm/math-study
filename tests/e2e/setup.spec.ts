import { test, expect } from '@playwright/test';

// Simple test to verify Playwright setup
test.describe('Playwright Setup Verification', () => {
  test('should be able to create a page', async ({ page }) => {
    // This test verifies that Playwright is properly configured
    // and can create a browser page
    expect(page).toBeDefined();
    await page.setContent('<h1>Test Page</h1>');
    await expect(page.locator('h1')).toContainText('Test Page');
  });

  test('should be able to navigate to external sites', async ({ page }) => {
    // Test external navigation to verify browser functionality
    await page.goto('https://example.com');
    await expect(page.locator('h1')).toContainText('Example Domain');
  });
});