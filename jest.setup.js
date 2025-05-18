// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
  }),
}));

// Mock next/dynamic to avoid issues with dynamic imports
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (...args) => {
    const dynamicModule = jest.requireActual('next/dynamic');
    const mockDynamic = dynamicModule.default;
    const [importFunc, options] = args;
    
    // If the component is imported with ssr: false, render it directly
    if (options && options.ssr === false) {
      const Component = importFunc();
      Component.displayName = 'MockedDynamicComponent';
      return Component;
    }
    
    return mockDynamic(...args);
  },
}));