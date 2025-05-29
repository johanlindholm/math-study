import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // Log entry for any request to authorize (GET or POST)
        console.log(`[NextAuth Credentials Authorize] Method: ${req?.method || 'unknown'}`)
        console.log("[NextAuth Credentials Authorize] Received credentials:", JSON.stringify(credentials, null, 2))

        // Specifically for the GET request that's causing the 500
        if (req?.method === "GET") {
          console.error("[NextAuth Credentials Authorize] WARNING: authorize called with GET request. This is unusual for credentials provider. Credentials object might be null or incomplete.")
          // You might want to return null or throw an error immediately if GET is not expected
          // For now, let's log and see if it proceeds and crashes later
        }

        if (!credentials?.email || !credentials?.password) {
          console.error("[NextAuth Credentials Authorize] Missing email or password in credentials.")
          // For a GET request, credentials might be null.
          // Depending on how NextAuth handles it, this might be the source of an error if code below expects credentials.
          throw new Error("Invalid credentials")
        }

        let user;
        try {
          console.log(`[NextAuth Credentials Authorize] Attempting to find user with email: ${credentials.email}`)
          user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })
          console.log("[NextAuth Credentials Authorize] Prisma user query result:", JSON.stringify(user ? { id: user.id, email: user.email, name: user.name, hasPassword: !!user.password } : null, null, 2))
        } catch (dbError) {
          console.error("[NextAuth Credentials Authorize] !!! DATABASE ERROR !!! while finding user:", dbError)
          console.error("[NextAuth Credentials Authorize] Database Error Name:", dbError instanceof Error ? dbError.name : "Unknown")
          console.error("[NextAuth Credentials Authorize] Database Error Message:", dbError instanceof Error ? dbError.message : "Unknown")
          console.error("[NextAuth Credentials Authorize] Database Error Stack:", dbError instanceof Error ? dbError.stack : "No stack")
          throw new Error("Database query failed during authorization.") // Re-throw to ensure it's marked as an error
        }

        if (!user || !user.password) {
          console.log("[NextAuth Credentials Authorize] No user found with that email or user has no password.")
          throw new Error("Invalid credentials")
        }

        let isPasswordValid;
        try {
          console.log("[NextAuth Credentials Authorize] Attempting to verify password for user:", user.email)
          isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )
          console.log("[NextAuth Credentials Authorize] Password validation result:", isPasswordValid)
        } catch (passwordError) {
          console.error("[NextAuth Credentials Authorize] !!! PASSWORD VERIFICATION ERROR !!!:", passwordError)
          console.error("[NextAuth Credentials Authorize] Password Error Name:", passwordError instanceof Error ? passwordError.name : "Unknown")
          console.error("[NextAuth Credentials Authorize] Password Error Message:", passwordError instanceof Error ? passwordError.message : "Unknown")
          console.error("[NextAuth Credentials Authorize] Password Error Stack:", passwordError instanceof Error ? passwordError.stack : "No stack")
          throw new Error("Password verification failed.") // Re-throw
        }

        if (!isPasswordValid) {
          console.log("[NextAuth Credentials Authorize] Password incorrect.")
          throw new Error("Invalid credentials")
        }

        console.log("[NextAuth Credentials Authorize] User authenticated successfully:", user.email)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      console.log("[NextAuth Session Callback] Called. Session:", JSON.stringify(session, null, 2), "Token:", JSON.stringify(token, null, 2))
      if (token && session.user) {
        session.user.id = token.id as string
      }
      console.log("[NextAuth Session Callback] Returning session:", JSON.stringify(session, null, 2))
      return session
    },
    async jwt({ token, user }) {
      console.log("[NextAuth JWT Callback] Called. Token:", JSON.stringify(token, null, 2), "User:", JSON.stringify(user, null, 2))
      if (user) {
        token.id = user.id
      }
      console.log("[NextAuth JWT Callback] Returning token:", JSON.stringify(token, null, 2))
      return token
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Optional: Add NextAuth.js debug mode for more verbose output from the library itself
  debug: process.env.NODE_ENV === 'development', // Enable more logs in development
  // For production, you might want to conditionally enable it for testing:
  // debug: process.env.NEXTAUTH_DEBUG === "true", // Then set NEXTAUTH_DEBUG=true in Vercel
}