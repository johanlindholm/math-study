import { PrismaClient } from '@prisma/client'
// Uncomment the following line if using Prisma Accelerate
// import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Standard Prisma Client
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// If using Prisma Accelerate, use this instead:
// export const prisma = globalForPrisma.prisma ?? new PrismaClient().$extends(withAccelerate())

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma