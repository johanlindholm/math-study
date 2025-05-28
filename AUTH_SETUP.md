# Authentication Setup Guide

This guide explains how to set up and use the authentication system with Prisma and NextAuth.

## Initial Setup

1. **Environment Variables**
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

   Generate a secure secret for NextAuth:
   ```bash
   openssl rand -base64 32
   ```
   
   Update the authentication secret in `.env` with the generated value. 
   For maximum compatibility, you can use either `AUTH_SECRET` (recommended for newer setups) or `NEXTAUTH_SECRET` (legacy):
   ```bash
   # Option 1: Newer Auth.js v5+ compatible (recommended)
   AUTH_SECRET=your_generated_secret_here
   
   # Option 2: Legacy NextAuth.js v4 compatible
   NEXTAUTH_SECRET=your_generated_secret_here
   
   # Option 3: Both for maximum compatibility
   AUTH_SECRET=your_generated_secret_here
   NEXTAUTH_SECRET=your_generated_secret_here
   ```

2. **Initialize Database**
   ```bash
   npm run db:generate  # Generate Prisma client
   npm run db:push      # Create database tables
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Features

- **User Registration**: `/auth/signup`
- **User Login**: `/auth/signin`
- **Session Management**: Automatic session handling with JWT
- **Protected Routes**: Use `useSession` hook to protect pages
- **User Menu**: Shows authentication status in header

## Database Management

- **View Database**: `npm run db:studio` - Opens Prisma Studio
- **Update Schema**: After modifying `prisma/schema.prisma`, run:
  ```bash
  npm run db:generate
  npm run db:push
  ```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `/api/auth/[...nextauth]` - NextAuth endpoints (signin, signout, etc.)

## Usage in Components

```typescript
// Check authentication status
import { useSession } from "next-auth/react"

export default function Component() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <p>Loading...</p>
  if (!session) return <p>Please sign in</p>
  
  return <p>Welcome {session.user.email}</p>
}
```

## Protecting API Routes

```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }
  
  // Your protected logic here
}
```

## Adding OAuth Providers

To add providers like Google or GitHub:

1. Add credentials to `.env`
2. Update `lib/auth.ts` to include the provider
3. Import the provider from `next-auth/providers`

Example:
```typescript
import GoogleProvider from "next-auth/providers/google"

providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  // ... existing providers
]
```