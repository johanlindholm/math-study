import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Catch-all for the handler itself to log any top-level errors
async function nextAuthHandler(req: Request) {
  try {
    console.log(`[NextAuth Route Handler] Incoming request: ${req.method} ${req.url}`)
    const handler = NextAuth(authOptions)
    return await handler(req)
  } catch (error) {
    console.error("[NextAuth Route Handler] !!! UNHANDLED ERROR IN NextAuth HANDLER !!!:", error)
    console.error("[NextAuth Route Handler] Error Name:", error instanceof Error ? error.name : "Unknown")
    console.error("[NextAuth Route Handler] Error Message:", error instanceof Error ? error.message : "Unknown")
    console.error("[NextAuth Route Handler] Error Stack:", error instanceof Error ? error.stack : "No stack")
    // Re-throw to ensure proper error handling
    throw error
  }
}

// For App Router (app/api/auth/[...nextauth]/route.ts)
export { nextAuthHandler as GET, nextAuthHandler as POST }