import { test, expect } from '@playwright/test';

test.describe('Authentication Pages Example', () => {
  test('should demonstrate complete UI testing setup', async ({ page }) => {
    // This test demonstrates how to test authentication pages
    // when the development server is running
    
    // Navigate to signup page
    await page.goto('/auth/signup');
    
    // Verify page loaded correctly
    await expect(page.locator('h2')).toContainText('Create a new account');
    
    // Test form interaction
    await page.fill('#name', 'Test User');
    await page.fill('#email-address', 'test@example.com');
    await page.fill('#password', 'securepassword123');
    
    // Verify form values
    await expect(page.locator('#name')).toHaveValue('Test User');
    await expect(page.locator('#email-address')).toHaveValue('test@example.com');
    await expect(page.locator('#password')).toHaveValue('securepassword123');
    
    // Test navigation to signin page
    await page.click('a[href="/auth/signin"]');
    await expect(page).toHaveURL('/auth/signin');
    await expect(page.locator('h2')).toContainText('Sign in to your account');
    
    // Test signin form
    await page.fill('#email-address', 'existing@example.com');
    await page.fill('#password', 'password123');
    
    // Note: In a real test with backend, you would test actual form submission
    // For now, we just verify the UI elements work correctly
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });
});