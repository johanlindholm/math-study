// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill Web APIs needed for Next.js API routes
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock fetch for Node.js environment
global.fetch = jest.fn();

// Mock Request and Response for Next.js API routes
Object.defineProperty(globalThis, 'Request', {
  value: class Request {
    constructor(input, init) {
      this.url = input;
      this.method = init?.method || 'GET';
      this.headers = new Map(Object.entries(init?.headers || {}));
      this.body = init?.body || null;
    }
    
    async json() {
      return JSON.parse(this.body);
    }
  },
  writable: true
});

Object.defineProperty(globalThis, 'Response', {
  value: class Response {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || 'OK';
      this.headers = new Map(Object.entries(init?.headers || {}));
    }
    
    async json() {
      return JSON.parse(this.body);
    }
  },
  writable: true
});

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

// Mock Next.js App Router navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn().mockImplementation(key => {
      if (key === 'type') return 'multiplication';
      return null;
    }),
    getAll: jest.fn(),
    has: jest.fn(),
    entries: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    toString: jest.fn(),
  }),
  usePathname: () => '/',
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