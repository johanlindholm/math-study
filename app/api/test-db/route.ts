import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const startTime = Date.now()
  const environment = process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown'
  
  console.log('[DB Test] Starting database connection test:', {
    environment,
    timestamp: new Date().toISOString()
  })
  
  try {
    // Try a simple query - Prisma will handle connection pooling automatically
    const userCount = await prisma.user.count()
    
    const response = {
      success: true,
      userCount,
      message: 'Database connection successful',
      environment,
      responseTime: `${Date.now() - startTime}ms`
    }
    
    console.log('[DB Test] Success:', response)
    
    return NextResponse.json(response)
  } catch (error) {
    const errorDetails = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorName: error instanceof Error ? error.name : 'UnknownError',
      environment,
      responseTime: `${Date.now() - startTime}ms`,
      // In non-production, include more details
      details: (process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview') ? {
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error
      } : undefined
    }
    
    console.error('[DB Test] Database connection error:', errorDetails)
    
    return NextResponse.json(errorDetails, { status: 500 })
  }
}