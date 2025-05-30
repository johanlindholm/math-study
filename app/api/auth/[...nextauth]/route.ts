import { NextRequest, NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import type { NextAuthOptions } from "next-auth"

// Create handler with proper types
const handler = NextAuth(authOptions)

// Helper function to handle auth requests
async function handleAuthRequest(
  request: NextRequest,
  params: Promise<{ nextauth: string[] }>,
  method: string
) {
  // Await params as required in Next.js 15
  const resolvedParams = await params
  const segments = resolvedParams.nextauth || []
  
  // Only log in development
  if (process.env.NODE_ENV === "development") {
    const url = new URL(request.url)
    console.log(`[NextAuth] ${method} request:`, {
      url: url.toString(),
      segments,
      pathname: url.pathname
    })
  }
  
  try {
    // Call the handler with proper request context
    return await handler(request as any, { params: resolvedParams } as any)
  } catch (error) {
    console.error(`[NextAuth] ${method} Error:`, error)
    // Return a proper error response
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 }
    )
  }
}

// Export named functions for App Router
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nextauth: string[] }> }
) {
  return handleAuthRequest(request, params, "GET")
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ nextauth: string[] }> }
) {
  return handleAuthRequest(request, params, "POST")
}