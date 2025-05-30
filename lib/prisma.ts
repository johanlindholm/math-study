import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// Check if we're in Vercel build environment
const isVercelBuild = process.env.VERCEL && process.env.CI

// Enable logging in development and preview environments
const shouldLog = process.env.NODE_ENV === 'development' || 
                  process.env.VERCEL_ENV === 'preview' ||
                  process.env.VERCEL_ENV === 'development'

// Configure Prisma logging
const logConfig = shouldLog ? [
  { level: 'query', emit: 'event' },
  { level: 'error', emit: 'stdout' },
  { level: 'warn', emit: 'stdout' },
  { level: 'info', emit: 'stdout' }
] : ['error', 'warn']

// Create Prisma Client instance with Accelerate
const prismaClientSingleton = () => {
  // During Vercel build, create a client that won't connect
  if (isVercelBuild) {
    // Use a dummy URL that satisfies Prisma's validation
    const originalUrl = process.env.DATABASE_URL
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
    
    const client = new PrismaClient({ 
      log: logConfig as any,
      // Disable all database operations during build
      datasources: {
        db: {
          url: 'postgresql://user:pass@localhost:5432/db'
        }
      }
    })
    
    // Restore original URL
    process.env.DATABASE_URL = originalUrl
    
    return client.$extends(withAccelerate())
  }
  
  // Normal runtime initialization
  return new PrismaClient({ 
    log: logConfig as any 
  }).$extends(withAccelerate())
}

// Declare type for the extended client
declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

// Log query events in non-production
// Note: $on is deprecated in newer Prisma versions, but still works
if (shouldLog && !isVercelBuild && typeof (prisma as any).$on === 'function') {
  (prisma as any).$on('query', (e: any) => {
    console.log('[Prisma Query]:', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
      timestamp: new Date().toISOString()
    })
  })
}

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma