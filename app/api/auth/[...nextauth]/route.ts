import { NextRequest, NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import type { NextAuthOptions } from "next-auth"

// Create handler with proper types
const handler = NextAuth(authOptions)

// Export named functions for App Router
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nextauth: string[] }> }
) {
  // Await params as required in Next.js 15
  const resolvedParams = await params
  const segments = resolvedParams.nextauth || []
  
  // Create a new request with the correct URL structure
  const url = new URL(request.url)
  
  // Log for debugging
  console.log("[NextAuth] GET request:", {
    url: url.toString(),
    segments,
    pathname: url.pathname
  })
  
  try {
    // Call the handler with proper request context
    return await handler(request as any, { params: resolvedParams } as any)
  } catch (error) {
    console.error("[NextAuth] GET Error:", error)
    // Return a proper error response
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ nextauth: string[] }> }
) {
  // Await params as required in Next.js 15
  const resolvedParams = await params
  const segments = resolvedParams.nextauth || []
  
  // Log for debugging
  const url = new URL(request.url)
  
  console.log("[NextAuth] POST request:", {
    url: url.toString(),
    segments,
    pathname: url.pathname
  })
  
  try {
    // Call the handler with proper request context
    return await handler(request as any, { params: resolvedParams } as any)
  } catch (error) {
    console.error("[NextAuth] POST Error:", error)
    // Return a proper error response
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 }
    )
  }
}