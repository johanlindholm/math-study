import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test basic connection
    await prisma.$connect()
    
    // Try a simple query
    const userCount = await prisma.user.count()
    
    return NextResponse.json({ 
      success: true, 
      userCount,
      message: 'Database connection successful'
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      // In production, don't expose full error details
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}