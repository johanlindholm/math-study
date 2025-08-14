import { test, expect } from '@playwright/test';

test.describe('Custom Game Mode E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the main math page
    await page.goto('http://localhost:3000/math');
  });

  test('should allow configuring and playing custom multiplication game', async ({ page }) => {
    // Click on Custom Mode for Multiplication
    await page.click('text=Custom Mode');
    
    // Wait for modal to appear
    await expect(page.locator('text=Custom Multiplication Game')).toBeVisible();
    
    // Set custom configuration
    await page.fill('input[placeholder="1,2,3 or 2-10"]', '2,3');
    await page.fill('input[min="1"][max="20"]', '1'); // Multiplier Min
    await page.fill('input[min="1"][max="20"]:nth-of-type(2)', '5'); // Multiplier Max
    await page.selectOption('select', '3'); // 3 answer choices
    
    // Start the custom game
    await page.click('text=Start Custom Game');
    
    // Wait for game to load
    await expect(page.locator('text=Multiplication Game')).toBeVisible();
    await expect(page.locator('text=(Custom)')).toBeVisible();
    
    // Check that we have exactly 3 answer buttons
    const answerButtons = page.locator('button:has-text(/^\\d+$/)');
    await expect(answerButtons).toHaveCount(3);
    
    // Check that all buttons are visible (not flickering)
    for (let i = 0; i < 3; i++) {
      await expect(answerButtons.nth(i)).toBeVisible();
    }
    
    // Get the math problem
    const problem = await page.locator('p:has-text(/\\d+ × \\d+/)').textContent();
    const match = problem?.match(/(\\d+) × (\\d+)/);
    const expectedResult = parseInt(match![1]) * parseInt(match![2]);
    
    // Find and click the correct answer
    const correctButton = page.locator(`button:has-text("${expectedResult}")`);
    await correctButton.click();
    
    // Wait a moment for the next question
    await page.waitForTimeout(500);
    
    // Verify we still have 3 answer buttons after answering
    await expect(answerButtons).toHaveCount(3);
    
    // All buttons should still be visible (no disappearing buttons)
    for (let i = 0; i < 3; i++) {
      await expect(answerButtons.nth(i)).toBeVisible();
    }
    
    // Check that we have a new problem
    const newProblem = await page.locator('p:has-text(/\\d+ × \\d+/)').textContent();
    // The problem might be the same due to small range, so just check buttons are there
    await expect(answerButtons.first()).toBeVisible();
  });

  test('should maintain button visibility throughout multiple answers', async ({ page }) => {
    // Set up a custom addition game with 4 choices
    await page.click('button:has-text("Custom Mode"):nth-of-type(2)'); // Addition custom mode
    
    await expect(page.locator('text=Custom Addition Game')).toBeVisible();
    
    // Set ranges
    await page.fill('input:nth-of-type(1)', '1'); // Min
    await page.fill('input:nth-of-type(2)', '5');  // Max  
    await page.selectOption('select', '4'); // 4 answer choices
    
    await page.click('text=Start Custom Game');
    
    // Wait for game to load
    await expect(page.locator('text=Addition Game')).toBeVisible();
    
    const answerButtons = page.locator('button:has-text(/^\\d+$/)');
    
    // Play multiple rounds to test consistency
    for (let round = 0; round < 3; round++) {
      // Verify we have 4 buttons
      await expect(answerButtons).toHaveCount(4);
      
      // All should be visible
      for (let i = 0; i < 4; i++) {
        await expect(answerButtons.nth(i)).toBeVisible();
      }
      
      // Get the problem and solve it
      const problem = await page.locator('p:has-text(/\\d+ \\+ \\d+/)').textContent();
      const match = problem?.match(/(\\d+) \\+ (\\d+)/);
      const expectedResult = parseInt(match![1]) + parseInt(match![2]);
      
      // Click correct answer
      const correctButton = page.locator(`button:has-text("${expectedResult}")`);
      await correctButton.click();
      
      // Wait for transition
      await page.waitForTimeout(500);
    }
    
    // Final check - should still have all buttons visible
    await expect(answerButtons).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(answerButtons.nth(i)).toBeVisible();
    }
  });

  test('should handle incorrect answers without losing buttons', async ({ page }) => {
    // Set up a custom subtraction game
    await page.click('button:has-text("Custom Mode"):nth-of-type(3)'); // Subtraction
    
    await expect(page.locator('text=Custom Subtraction Game')).toBeVisible();
    
    await page.fill('input:nth-of-type(1)', '5'); // Min
    await page.fill('input:nth-of-type(2)', '10'); // Max
    await page.selectOption('select', '2'); // 2 answer choices
    
    await page.click('text=Start Custom Game');
    
    await expect(page.locator('text=Subtraction Game')).toBeVisible();
    
    const answerButtons = page.locator('button:has-text(/^\\d+$/)');
    await expect(answerButtons).toHaveCount(2);
    
    // Get the problem
    const problem = await page.locator('p:has-text(/\\d+ - \\d+/)').textContent();
    const match = problem?.match(/(\\d+) - (\\d+)/);
    const expectedResult = parseInt(match![1]) - parseInt(match![2]);
    
    // Click the wrong answer
    const wrongButton = answerButtons.filter({ hasNotText: expectedResult.toString() }).first();
    await wrongButton.click();
    
    // Wait for the incorrect answer sequence to complete
    await page.waitForTimeout(2000);
    
    // Should still have buttons after incorrect answer sequence
    await expect(answerButtons).toHaveCount(2);
    for (let i = 0; i < 2; i++) {
      await expect(answerButtons.nth(i)).toBeVisible();
    }
  });
});