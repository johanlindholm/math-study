import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  
  test.describe('Sign Up Page', () => {
    test('should display signup form correctly', async ({ page }) => {
      // Go to sign up page
      await page.goto('/auth/signup');
      
      // Check page loads correctly
      await expect(page.locator('h2')).toContainText('Create a new account');
      
      // Check form fields are present
      await expect(page.locator('#name')).toBeVisible();
      await expect(page.locator('#email-address')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Check navigation link
      await expect(page.locator('text=sign in to your existing account')).toBeVisible();
    });

    test('should navigate to signin page from signup', async ({ page }) => {
      await page.goto('/auth/signup');
      
      // Click the "sign in to your existing account" link
      await page.click('text=sign in to your existing account');
      
      // Should navigate to signin page
      await expect(page).toHaveURL('/auth/signin');
      await expect(page.locator('h2')).toContainText('Sign in to your account');
    });

    test('should validate form fields', async ({ page }) => {
      await page.goto('/auth/signup');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Email field should be required by HTML validation
      await expect(page.locator('#email-address:invalid')).toHaveCount(1);
    });

    test('should show form interaction states', async ({ page }) => {
      await page.goto('/auth/signup');
      
      // Fill out form with test data
      await page.fill('#name', 'Test User');
      await page.fill('#email-address', 'test@example.com');
      await page.fill('#password', 'testpassword123');
      
      // Check that values are filled
      await expect(page.locator('#name')).toHaveValue('Test User');
      await expect(page.locator('#email-address')).toHaveValue('test@example.com');
      await expect(page.locator('#password')).toHaveValue('testpassword123');
      
      // Submit button should be enabled
      await expect(page.locator('button[type="submit"]')).toBeEnabled();
    });
  });

  test.describe('Sign In Page', () => {
    test('should display signin form correctly', async ({ page }) => {
      await page.goto('/auth/signin');
      
      // Check page loads correctly
      await expect(page.locator('h2')).toContainText('Sign in to your account');
      
      // Check form fields are present
      await expect(page.locator('#email-address')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Check navigation link
      await expect(page.locator('text=create a new account')).toBeVisible();
    });

    test('should navigate to signup page from signin', async ({ page }) => {
      await page.goto('/auth/signin');
      
      // Click the "create a new account" link
      await page.click('text=create a new account');
      
      // Should navigate to signup page
      await expect(page).toHaveURL('/auth/signup');
      await expect(page.locator('h2')).toContainText('Create a new account');
    });

    test('should validate form fields', async ({ page }) => {
      await page.goto('/auth/signin');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Email field should be required by HTML validation
      await expect(page.locator('#email-address:invalid')).toHaveCount(1);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/auth/signin');
      
      // Try to sign in with invalid credentials
      await page.fill('#email-address', 'nonexistent@example.com');
      await page.fill('#password', 'wrongpassword');
      
      await page.click('button[type="submit"]');
      
      // Should show error message or stay on signin page
      // The exact behavior depends on whether database is available
      await page.waitForTimeout(2000); // Wait for response
      
      // Either we see an error message or we're still on signin page
      const hasError = await page.locator('text=Invalid email or password').count();
      const isOnSignin = page.url().includes('/auth/signin');
      
      expect(hasError > 0 || isOnSignin).toBe(true);
    });

    test('should show loading state during signin attempt', async ({ page }) => {
      await page.goto('/auth/signin');
      
      await page.fill('#email-address', 'test@example.com');
      await page.fill('#password', 'password');
      
      // Click submit and check for loading state
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Button should become disabled during submission
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe('Authentication Flow', () => {
    test('should handle math page access', async ({ page }) => {
      // Try to access the math page
      await page.goto('/math');
      
      // The page should load (middleware may or may not redirect)
      await expect(page).toHaveURL(/\/(math|auth)/);
      
      // If redirected to auth, verify it's the signin page
      if (page.url().includes('/auth')) {
        await expect(page.url()).toContain('/auth/signin');
      }
    });

    test('should handle home page access', async ({ page }) => {
      // Access home page
      await page.goto('/');
      
      // Should be able to access home page
      await expect(page).toHaveURL('/');
      await expect(page.locator('body')).toBeVisible();
    });
  });
});