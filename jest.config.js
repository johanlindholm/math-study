const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (if you have them in tsconfig.json)
    '^@/(.*)$': '<rootDir>/$1',
    // Mock jose and related modules
    '^jose$': '<rootDir>/__mocks__/jose.js',
    // Mock @panva modules
    '^@panva/hkdf$': '<rootDir>/__mocks__/panva-hkdf.js',
  },
  testMatch: [
    '**/__tests__/**/*.ts?(x)', 
    '**/?(*.)+(spec|test).ts?(x)'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/tests/e2e/'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(jose|@panva)/)',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);