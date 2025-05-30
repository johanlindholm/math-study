import { NextResponse } from 'next/server'

export async function GET() {
  // Only allow in non-production environments
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const debugInfo = {
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      DATABASE_URL: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set (hidden)' : 'Not set',
    },
    auth: {
      hasAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasAuthUrl: !!process.env.NEXTAUTH_URL,
      authUrlValue: process.env.NEXTAUTH_URL || 'Not set',
    },
    database: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      provider: process.env.DATABASE_URL?.includes('postgresql') ? 'PostgreSQL' : 
                process.env.DATABASE_URL?.includes('mysql') ? 'MySQL' : 
                process.env.DATABASE_URL?.includes('sqlite') ? 'SQLite' : 'Unknown'
    },
    timestamp: new Date().toISOString()
  }

  console.log('[Debug] Environment info requested:', debugInfo)

  return NextResponse.json(debugInfo)
}