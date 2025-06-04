// Global setup for Playwright tests
import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('Setting up Playwright tests...');
  
  // Set environment variables for testing
  process.env.NEXTAUTH_SECRET = 'test-secret-for-playwright';
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
  
  // Skip database operations in tests if DB is not available
  process.env.SKIP_DB_OPERATIONS = 'true';
  
  console.log('Playwright global setup complete');
}

export default globalSetup;