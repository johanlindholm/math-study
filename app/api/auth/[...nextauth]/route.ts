<<<<<<< Updated upstream
import { NextRequest, NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
// Create handler with proper types
const handler = NextAuth(authOptions)

// Helper to check if we should log (development or Vercel preview)
const shouldLog = () => {
  return process.env.NODE_ENV === "development" || 
         process.env.VERCEL_ENV === "preview" ||
         process.env.VERCEL_ENV === "development"
}

// Helper function to handle auth requests
async function handleAuthRequest(
  request: NextRequest,
  params: Promise<{ nextauth: string[] }>,
  method: "GET" | "POST"
) {
  // Await params as required in Next.js 15
  const resolvedParams = await params
  const segments = resolvedParams.nextauth || []
  const url = new URL(request.url)
  
  // Log in development and preview environments
  if (shouldLog()) {
    console.log(`[NextAuth] ${method} request:`, {
      url: url.toString(),
      segments,
      pathname: url.pathname,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
      headers: {
        host: request.headers.get('host'),
        referer: request.headers.get('referer'),
        'user-agent': request.headers.get('user-agent')
      }
    })
  }
  
  try {
    // Call the handler with proper request context
    const response = await handler(request as any, { params: resolvedParams } as any)
    
    // Log successful responses in non-production
    if (shouldLog()) {
      console.log(`[NextAuth] ${method} Success:`, {
        pathname: url.pathname,
        status: response.status,
        statusText: response.statusText
      })
    }
    
    return response
  } catch (error) {
    // Always log errors, even in production
    const errorDetails = {
      method,
      pathname: url.pathname,
      segments,
      error: error instanceof Error ? {
        message: error.message,
        stack: shouldLog() ? error.stack : undefined,
        name: error.name
      } : String(error),
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV
    }
    
    console.error(`[NextAuth] ${method} Error:`, errorDetails)
    
    // Return a proper error response with more details in non-production
    const statusCode = error instanceof Error && error.message.includes("Invalid credentials") ? 401 : 500
    const errorResponse = {
      error: "Authentication error",
      ...(shouldLog() && {
        details: error instanceof Error ? error.message : String(error),
        path: url.pathname
      })
    }
    
    return NextResponse.json(errorResponse, { status: statusCode })
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
=======
import { authOptions } from "@/lib/auth"
import NextAuth from "next-auth"

// Create handler for each HTTP method
const handler = NextAuth(authOptions)

export const GET = handler
export const POST = handler
>>>>>>> Stashed changes
