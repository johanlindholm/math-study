import { test, expect } from '@playwright/test';

test.describe('Authentication UI Tests', () => {
  
  test.describe('Sign Up Page UI', () => {
    test('should display signup form elements', async ({ page }) => {
      // Navigate directly to signup page
      await page.goto('/auth/signup');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check that core UI elements are present
      await expect(page.locator('h2')).toContainText('Create a new account');
      
      // Form fields should be visible
      await expect(page.locator('#name')).toBeVisible();
      await expect(page.locator('#email-address')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Navigation link should be present
      await expect(page.locator('a[href="/auth/signin"]')).toBeVisible();
    });

    test('should have proper form field attributes', async ({ page }) => {
      await page.goto('/auth/signup');
      await page.waitForLoadState('networkidle');
      
      // Email field should have email type
      await expect(page.locator('#email-address')).toHaveAttribute('type', 'email');
      
      // Password field should have password type
      await expect(page.locator('#password')).toHaveAttribute('type', 'password');
      
      // Email should be required
      await expect(page.locator('#email-address')).toHaveAttribute('required');
      
      // Password should be required
      await expect(page.locator('#password')).toHaveAttribute('required');
    });

    test('should allow form interaction', async ({ page }) => {
      await page.goto('/auth/signup');
      await page.waitForLoadState('networkidle');
      
      // Fill out form fields
      await page.fill('#name', 'Test User');
      await page.fill('#email-address', 'test@example.com');
      await page.fill('#password', 'testpassword');
      
      // Verify values are set
      await expect(page.locator('#name')).toHaveValue('Test User');
      await expect(page.locator('#email-address')).toHaveValue('test@example.com');
      await expect(page.locator('#password')).toHaveValue('testpassword');
    });

    test('should navigate to signin page', async ({ page }) => {
      await page.goto('/auth/signup');
      await page.waitForLoadState('networkidle');
      
      // Click link to signin page
      await page.click('a[href="/auth/signin"]');
      
      // Should navigate to signin page
      await expect(page).toHaveURL('/auth/signin');
    });
  });

  test.describe('Sign In Page UI', () => {
    test('should display signin form elements', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');
      
      // Check that core UI elements are present
      await expect(page.locator('h2')).toContainText('Sign in to your account');
      
      // Form fields should be visible
      await expect(page.locator('#email-address')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Navigation link should be present
      await expect(page.locator('a[href="/auth/signup"]')).toBeVisible();
    });

    test('should have proper form field attributes', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');
      
      // Email field should have email type
      await expect(page.locator('#email-address')).toHaveAttribute('type', 'email');
      
      // Password field should have password type
      await expect(page.locator('#password')).toHaveAttribute('type', 'password');
      
      // Fields should be required
      await expect(page.locator('#email-address')).toHaveAttribute('required');
      await expect(page.locator('#password')).toHaveAttribute('required');
    });

    test('should allow form interaction', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');
      
      // Fill out form fields
      await page.fill('#email-address', 'test@example.com');
      await page.fill('#password', 'testpassword');
      
      // Verify values are set
      await expect(page.locator('#email-address')).toHaveValue('test@example.com');
      await expect(page.locator('#password')).toHaveValue('testpassword');
    });

    test('should navigate to signup page', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');
      
      // Click link to signup page
      await page.click('a[href="/auth/signup"]');
      
      // Should navigate to signup page
      await expect(page).toHaveURL('/auth/signup');
    });
  });

  test.describe('Page Accessibility', () => {
    test('signup page should have proper headings', async ({ page }) => {
      await page.goto('/auth/signup');
      await page.waitForLoadState('networkidle');
      
      // Should have main heading
      const heading = page.locator('h2');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText('Create a new account');
    });

    test('signin page should have proper headings', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');
      
      // Should have main heading
      const heading = page.locator('h2');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText('Sign in to your account');
    });

    test('forms should have proper labels', async ({ page }) => {
      await page.goto('/auth/signup');
      await page.waitForLoadState('networkidle');
      
      // Check that form fields have associated labels
      await expect(page.locator('label[for="name"]')).toBeVisible();
      await expect(page.locator('label[for="email-address"]')).toBeVisible();
      await expect(page.locator('label[for="password"]')).toBeVisible();
    });
  });
});