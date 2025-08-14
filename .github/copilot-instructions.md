# Math Learning Game Application

**ALWAYS follow these instructions first** and only use additional search or bash commands when the information here is incomplete or found to be in error.

This is a Next.js 15 math learning game application built with React 19, TypeScript, Prisma, and comprehensive testing infrastructure. The application teaches math skills through interactive multiplication, addition, and subtraction games with user authentication and leaderboards.

## Quick Start - Essential Commands

**NEVER CANCEL builds or tests** - Set appropriate timeouts and wait for completion.

### Initial Setup (First Time Only)
```bash
npm install                    # Takes ~17 seconds - NEVER CANCEL, set 60+ second timeout
npx playwright install         # Takes ~19 seconds - NEVER CANCEL, set 120+ second timeout
```

### Core Development Commands
```bash
npm run dev                    # Start development server - takes ~1.3 seconds, set 30+ second timeout
npm run build                  # Production build - takes ~22 seconds - NEVER CANCEL, set 90+ second timeout  
npm run lint                   # ESLint validation - takes ~2 seconds, set 30+ second timeout
```

### Testing Commands
```bash
npm run test                   # Jest unit tests - takes ~3.5 seconds, set 60+ second timeout
npm run test:watch            # Jest in watch mode
npm run test:cucumber:pretty   # BDD tests (scenarios defined, need implementations) - ~0.7 seconds
npm run test:e2e              # Playwright E2E tests - takes ~32 seconds - NEVER CANCEL, set 90+ second timeout
npm run test:e2e:headed       # E2E tests with visible browser
npm run test:e2e:ui           # Interactive E2E test runner
```

### Database Commands (Optional)
```bash
npm run db:generate           # Generate Prisma client - takes ~1 second, set 30+ second timeout
npm run db:push               # Push schema to database - REQUIRES DATABASE_URL environment variable
npm run db:studio            # Open Prisma Studio database interface
```

## Application Architecture

### Route Structure
- `/` - Home page (works without database)
- `/math` - Game selection page (requires authentication) 
- `/math/game?type={multiplication|addition|subtraction}` - Active games
- `/auth/signin` - User authentication 
- `/auth/signup` - User registration

### Database Requirements
- **OPTIONAL for basic functionality**: App builds and runs without DATABASE_URL
- **REQUIRED for full features**: Authentication, leaderboards, user data require PostgreSQL database
- Without database: Homepage loads, "Test Database" button shows proper error message
- With database: Full authentication workflow, game statistics, leaderboards

### Environment Variables (Optional)
```bash
DATABASE_URL="postgresql://user:pass@host:5432/dbname"  # For database features
NEXTAUTH_SECRET="your-secret-key"                       # For authentication  
NEXTAUTH_URL="http://localhost:3000"                   # For authentication
```

## Testing Strategy

### Unit Tests (Jest)
- **Location**: `__tests__` folders next to components
- **Coverage**: 52 tests covering game logic, UI components, API routes
- **Command**: `npm run test` (3.5 seconds)
- **Status**: All tests pass with some React state update warnings (expected)

### BDD Tests (Cucumber)  
- **Location**: `/features` directory with `.feature` files
- **Status**: Scenarios defined but step implementations missing
- **Command**: `npm run test:cucumber:pretty` (0.7 seconds)

### E2E Tests (Playwright)
- **Location**: `/tests/e2e` directory  
- **Coverage**: 25 tests for authentication flows, UI testing
- **Command**: `npm run test:e2e` (32 seconds)
- **Status**: All tests pass even without database (tests are designed to work independently)
- **Requirements**: Playwright browsers must be installed first

## Build Process Validation

### Successful Build Without Database
- Run `npm run build` - completes in ~22 seconds
- Shows Prisma warnings but builds successfully
- All static pages generate correctly
- Application can be deployed without database connection

### Development Server
- Run `npm run dev` - starts in ~1.3 seconds with Turbopack
- Application loads at http://localhost:3000
- Math games redirect to authentication when not signed in
- "Test Database" button provides clear error message without DATABASE_URL

## Validation Scenarios

**ALWAYS test these scenarios after making changes**:

### Basic Application Functionality
1. **Home Page Load**: Navigate to http://localhost:3000 - should load without errors
2. **Database Error Handling**: Click "Test Database" - should show clear error without DATABASE_URL
3. **Authentication Flow**: Visit /math - should redirect to /auth/signin
4. **Language Selection**: Verify English/Spanish/German options work

### Code Quality Validation
1. **Linting**: Always run `npm run lint` before committing - must pass with no errors
2. **Unit Tests**: Run `npm run test` - all 52 tests must pass  
3. **Type Checking**: Included in build process - TypeScript must compile cleanly
4. **Build Verification**: Run `npm run build` - must complete successfully

### Complete E2E Workflow
1. **Start dev server**: `npm run dev`
2. **Run E2E tests**: `npm run test:e2e` - all 25 tests must pass
3. **Manual verification**: Navigate through signup/signin forms (UI testing)

## Key Implementation Details

### Game Architecture
- **Configuration-driven**: Game types defined in `app/math/game/types.ts`
- **Custom Hook**: `useMathGame` manages game logic, scoring, difficulty progression
- **Dynamic Difficulty**: Questions get harder and more answer options as score increases
- **Timer System**: Games have countdown timers, auto-end when time expires

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19 with TypeScript, TailwindCSS v4
- **Backend**: API routes, Prisma with PostgreSQL, NextAuth.js
- **Testing**: Jest, Cucumber.js, Playwright
- **Internationalization**: next-intl with English, Spanish, German support

### Important Directories
```
/app                 # Next.js App Router pages and API routes
/app/math/game       # Math game implementations and logic
/components          # Reusable React components
/lib                 # Utilities (Prisma client, auth configuration)  
/tests/e2e          # Playwright end-to-end tests
/features           # Cucumber BDD test scenarios
/prisma             # Database schema and migrations
```

## Common Development Tasks

### Adding New Game Types
1. Update `app/math/game/types.ts` with new game configuration
2. Add tests in `app/math/game/__tests__/`
3. Run `npm run test` to verify game logic
4. Test manually in development server

### Database Changes
1. Modify `prisma/schema.prisma`  
2. Run `npm run db:generate` to update client
3. Run `npm run db:push` to apply changes (requires DATABASE_URL)
4. Update any affected API routes and components

### Adding Tests
1. **Unit tests**: Create in `__tests__` folder next to component
2. **E2E tests**: Add to `/tests/e2e` directory  
3. **BDD scenarios**: Add to `/features` (step implementations needed)
4. Always run full test suite after changes

## Troubleshooting

### Build Issues
- **Prisma errors**: Check DATABASE_URL environment variable 
- **TypeScript errors**: Run build again, errors show exact file locations
- **Long build times**: Normal for first build, use Turbopack in development

### Test Issues  
- **E2E failures**: Ensure `npx playwright install` was run
- **Jest warnings**: React state update warnings are expected in some tests
- **Cucumber undefined steps**: Step implementations need to be added

### Development Server Issues
- **Port conflicts**: Default port 3000, change with `npm run dev -- -p 3001`
- **Database errors**: Expected without DATABASE_URL, doesn't prevent development
- **Slow startup**: Turbopack significantly faster than standard webpack

**Remember**: This application is designed to work without a database for basic functionality. Focus on the core math game features when DATABASE_URL is not available.