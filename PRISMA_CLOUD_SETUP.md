# Prisma Data Platform Setup Guide

This guide explains how to connect your application to Prisma Data Platform (formerly Prisma Cloud).

## Prerequisites

1. Sign up for a Prisma Data Platform account at [https://cloud.prisma.io](https://cloud.prisma.io)
2. Create a new project in the Prisma Data Platform dashboard

## Setup Steps

### 1. Create a Database

In the Prisma Data Platform dashboard:
1. Click "New Database" or use an existing PostgreSQL database
2. Choose your preferred region
3. Wait for the database to be provisioned

### 2. Get Your Connection String

1. In your project dashboard, click on your database
2. Copy the connection string (it will look like):
   ```
   postgresql://username:password@host.databases.prisma.io:5432/dbname?schema=public
   ```

### 3. Update Environment Variables

Update your `.env` file with the connection string:

```env
DATABASE_URL="postgresql://username:password@host.databases.prisma.io:5432/dbname?schema=public"
```

### 4. Push Schema to Database

Run the following commands to set up your database:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

## Using Prisma Accelerate (Optional)

Prisma Accelerate provides connection pooling and global caching.

### 1. Enable Accelerate

In your Prisma Data Platform project:
1. Go to "Settings" → "Accelerate"
2. Enable Accelerate
3. Copy your API key

### 2. Install Accelerate Extension

```bash
npm install @prisma/extension-accelerate
```

### 3. Update Environment Variables

Add your Accelerate API key to `.env`:

```env
PRISMA_API_KEY="your-accelerate-api-key"
```

### 4. Update Prisma Client

Update `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? 
  new PrismaClient().$extends(withAccelerate())

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Connection Pooling

For production environments, add connection pooling parameters:

```env
DATABASE_URL="postgresql://username:password@host.databases.prisma.io:5432/dbname?schema=public&connection_limit=5&pgbouncer=true"
```

Parameters:
- `connection_limit`: Maximum number of connections (default: 5)
- `pgbouncer`: Enable PgBouncer for connection pooling

## Migrations

For production deployments, use migrations instead of `db push`:

```bash
# Create a migration
npx prisma migrate dev --name init

# Apply migrations in production
npx prisma migrate deploy
```

## Monitoring

The Prisma Data Platform provides:
- Query insights
- Performance metrics
- Error tracking
- Database metrics

Access these in your project dashboard under "Insights".

## Troubleshooting

### SSL Connection Issues

If you encounter SSL errors, add SSL parameters:

```env
DATABASE_URL="postgresql://...?schema=public&sslmode=require"
```

### Connection Timeout

Increase the connection timeout:

```env
DATABASE_URL="postgresql://...?schema=public&connect_timeout=30"
```

### Rate Limiting

Prisma Data Platform has rate limits. Check your plan's limits in the dashboard.

## Best Practices

1. **Use Connection Pooling**: Always enable PgBouncer for production
2. **Set Connection Limits**: Don't exceed your plan's connection limit
3. **Use Accelerate**: For global applications, enable Accelerate for better performance
4. **Monitor Usage**: Regularly check your dashboard for performance insights
5. **Secure API Keys**: Never commit API keys to version control

## Useful Commands

```bash
# View current database state
npm run db:studio

# Generate Prisma Client
npm run db:generate

# Push schema changes
npm run db:push

# Create migration
npx prisma migrate dev

# Deploy migrations
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```