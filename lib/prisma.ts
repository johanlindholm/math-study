import { PrismaClient } from '@prisma/client'
// Uncomment the following line if using Prisma Accelerate
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

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

// Standard Prisma Client with logging
// export const prisma = globalForPrisma.prisma ?? new PrismaClient({
//   log: logConfig as any
// })

// If using Prisma Accelerate, use this instead:
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: logConfig as any }).$extends(withAccelerate())

// Log query events in non-production
// Note: $on is deprecated in newer Prisma versions, but still works
if (shouldLog && typeof (prisma as any).$on === 'function') {
  (prisma as any).$on('query', (e: any) => {
    console.log('[Prisma Query]:', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
      timestamp: new Date().toISOString()
    })
  })
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma