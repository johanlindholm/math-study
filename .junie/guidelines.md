# Math Study Project Development Guidelines

This document provides essential information for developers working on the Math Study project.

## Build/Configuration Instructions

### Prerequisites

- Node.js (v18 or later recommended)
- npm (v9 or later recommended)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

The project uses Next.js 15 with Turbopack for faster development:

```bash
npm run dev
```

This will start the development server at [http://localhost:3000](http://localhost:3000).

### Production Build

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

### Key Configuration Files

- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `postcss.config.mjs` - PostCSS configuration for TailwindCSS

## Testing Information

### Testing Setup

The project uses Jest and React Testing Library for testing. The configuration is in:

- `jest.config.js` - Main Jest configuration
- `jest.setup.js` - Setup file for Jest that includes mocks and imports

### Running Tests

To run all tests:

```bash
npm test
```

To run tests in watch mode (recommended during development):

```bash
npm run test:watch
```

### Adding New Tests

Tests are located in `__tests__` directories adjacent to the components they test.

#### Test File Naming Convention

- Component tests: `ComponentName.test.tsx`
- Utility function tests: `utilityName.test.ts`

#### Example Test Structure

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import YourComponent from '../YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    render(<YourComponent />);
    fireEvent.click(screen.getByText('Click Me'));
    expect(screen.getByText('Result After Click')).toBeInTheDocument();
  });
});
```

### Mocking Dependencies

For components that use external dependencies like the Confetti component, create mocks in the test file:

```typescript
jest.mock('react-confetti', () => {
  return function MockConfetti() {
    return <div data-testid="confetti">Confetti Effect</div>;
  };
});
```

For Next.js specific features, use the mocks provided in `jest.setup.js`.

## Additional Development Information

### Project Structure

- `app/` - Main application code (Next.js App Router)
  - `page.tsx` - Home page
  - `layout.tsx` - Root layout
  - `math/` - Math study game
    - `page.tsx` - Main game component

### Code Style

- The project uses TypeScript for type safety
- React components use functional components with hooks
- State management is done with React's useState and useEffect hooks
- TailwindCSS is used for styling

### Key Components

#### MathPage (`app/math/page.tsx`)

This is the main game component that:
- Generates random multiplication problems
- Tracks user score
- Implements a timer
- Shows confetti animation for correct answers
- Implements visual feedback (shaking) for incorrect answers

### Performance Considerations

- The Confetti component is loaded dynamically with `next/dynamic` to reduce initial bundle size
- The game uses CSS transitions for smooth animations
- Timer updates are optimized to minimize re-renders

### Debugging Tips

- Use React DevTools to inspect component state
- For timer-related issues, check the useEffect dependency array
- For animation issues, inspect CSS classes and transitions
- For testing issues, ensure mocks are properly set up for external dependencies