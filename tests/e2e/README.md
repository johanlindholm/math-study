# Playwright End-to-End Testing

This directory contains end-to-end tests using Playwright for the Math Study application.

## Setup

Playwright has been configured to test the authentication flows and UI interactions. The tests are designed to work with or without a running database.

### Installation

Playwright and its dependencies are installed as part of the project setup:

```bash
npm install
```

### Browser Installation

Install the required browsers:

```bash
npx playwright install chromium
```

## Running Tests

### Basic E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug
```

### With Development Server

To run tests against a live development server:

```bash
# Start dev server in one terminal
npm run dev

# Run E2E tests in another terminal
npm run test:e2e
```

### Without Development Server

For UI-only testing without backend functionality:

```bash
SKIP_DEV_SERVER=true npm run test:e2e
```

## Test Structure

### Auth UI Tests (`auth-ui.spec.ts`)

Tests the authentication UI components without requiring backend functionality:

- **Sign Up Page UI**: Form elements, validation attributes, navigation
- **Sign In Page UI**: Form elements, validation attributes, navigation  
- **Page Accessibility**: Proper headings, labels, and structure

### Auth Flow Tests (`auth.spec.ts`)

Tests the complete authentication workflows (requires running server):

- **Sign Up Flow**: Account creation, error handling, redirection
- **Sign In Flow**: Login process, invalid credentials, loading states
- **Authentication Flow**: Protected route access, session management

## Configuration

### Environment Variables

Create `.env.test` for test-specific configuration:

```bash
DATABASE_URL="postgresql://test:test@localhost:5432/test"
NEXTAUTH_SECRET="test-secret-for-e2e-tests"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="test"
```

### Playwright Configuration

Key configuration options in `playwright.config.ts`:

- **Test Directory**: `./tests/e2e`
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium (Firefox and WebKit available)
- **Screenshots**: On failure only
- **Traces**: On first retry
- **Dev Server**: Auto-starts unless `SKIP_DEV_SERVER=true`

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/some-page');
    await expect(page.locator('h1')).toContainText('Expected Text');
  });
});
```

### Best Practices

1. **Use data-testid for stable selectors**: 
   ```typescript
   await page.locator('[data-testid="submit-button"]').click();
   ```

2. **Wait for page state when needed**:
   ```typescript
   await page.waitForLoadState('networkidle');
   ```

3. **Test user interactions, not implementation**:
   - Test what users can see and do
   - Don't test internal state or API calls directly

4. **Use page.goto() with relative URLs**:
   ```typescript
   await page.goto('/auth/signin'); // Uses baseURL
   ```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**: 
   - For UI tests, these can be ignored
   - For flow tests, ensure database is running

2. **Timeout Issues**:
   - Increase timeouts in config if needed
   - Use `page.waitForLoadState()` for slow pages

3. **Element Not Found**:
   - Check that selectors match the actual HTML
   - Use browser dev tools to inspect elements

### Debugging

1. **Run with headed mode**:
   ```bash
   npm run test:e2e:headed
   ```

2. **Use debug mode**:
   ```bash
   npm run test:e2e:debug
   ```

3. **View test reports**:
   After running tests, open `playwright-report/index.html`

## CI/CD Integration

The tests are configured to work in CI environments:

- Retries failed tests twice in CI
- Uses single worker in CI for stability
- Screenshots and traces captured on failures
- HTML reports generated for debugging

Example GitHub Actions integration:

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: npm run test:e2e
```