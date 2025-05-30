# Vercel + Prisma Accelerate Setup

## Environment Variables

When using Prisma Accelerate with Vercel, you need to configure your environment variables properly to handle both build-time and runtime scenarios.

### Required Environment Variables in Vercel:

1. **DATABASE_URL** (for runtime)
   - Your Prisma Accelerate connection string
   - Format: `prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY`
   - Set this in all environments (Production, Preview, Development)

2. **DATABASE_URL** (for build time) - Override for Production only
   - Add a separate override just for the Production environment
   - Use a dummy PostgreSQL URL: `postgresql://user:pass@localhost:5432/db`
   - This satisfies Prisma's validation during build without attempting to connect

### How to Set Up in Vercel:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following:

   ```
   # For all environments (Production, Preview, Development)
   DATABASE_URL = prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY
   
   # Override for Production environment only
   DATABASE_URL = postgresql://user:pass@localhost:5432/db
   ```

4. Make sure to:
   - Set the Accelerate URL for Preview and Development environments
   - Set the dummy PostgreSQL URL only for Production builds

### Why This Works:

- During build time, Vercel uses the dummy PostgreSQL URL which satisfies Prisma's schema validation
- At runtime, your application uses the actual Prisma Accelerate connection string
- The build process completes successfully without trying to connect to a database
- Your application connects to Prisma Accelerate when actually serving requests

### Alternative Solution:

If you can't use environment variable overrides, the code in `lib/prisma.ts` includes a build-time detection mechanism that automatically handles this for you.