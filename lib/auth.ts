import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Helper to check if we should log
const shouldLog = process.env.NODE_ENV === 'development' || 
                  process.env.VERCEL_ENV === 'preview' ||
                  process.env.VERCEL_ENV === 'development'

export const authOptions: NextAuthOptions = {
  debug: shouldLog,
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const startTime = Date.now()
        
        if (shouldLog) {
          console.log("[Auth] Login attempt:", {
            email: credentials?.email,
            hasPassword: !!credentials?.password,
            environment: process.env.VERCEL_ENV || process.env.NODE_ENV
          })
        }

        if (!credentials?.email || !credentials?.password) {
          console.error("[Auth] Missing credentials")
          throw new Error("Invalid credentials")
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (shouldLog) {
            console.log("[Auth] Database query result:", {
              userFound: !!user,
              hasPassword: !!user?.password,
              queryTime: `${Date.now() - startTime}ms`
            })
          }

          if (!user || !user.password) {
            console.error("[Auth] User not found or no password:", {
              email: credentials.email,
              userFound: !!user,
              hasPassword: !!user?.password
            })
            throw new Error("Invalid credentials")
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.error("[Auth] Invalid password for user:", credentials.email)
            throw new Error("Invalid credentials")
          }

          if (shouldLog) {
            console.log("[Auth] Login successful:", {
              userId: user.id,
              email: user.email,
              totalTime: `${Date.now() - startTime}ms`
            })
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error("[Auth] Database error:", {
            error: error instanceof Error ? {
              message: error.message,
              name: error.name,
              stack: shouldLog ? error.stack : undefined
            } : String(error),
            email: credentials.email,
            totalTime: `${Date.now() - startTime}ms`
          })
          throw error
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (shouldLog) {
        console.log("[Auth] Session callback:", {
          hasToken: !!token,
          hasUser: !!session.user,
          tokenId: token?.id
        })
      }
      
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (shouldLog && user) {
        console.log("[Auth] JWT callback:", {
          userId: user.id,
          userEmail: user.email
        })
      }
      
      if (user) {
        token.id = user.id
      }
      return token
    }
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log("[Auth] SignIn event:", {
        userId: user?.id,
        userEmail: user?.email,
        isNewUser,
        provider: account?.provider
      })
    },
    async signOut({ session, token }) {
      console.log("[Auth] SignOut event:", {
        sessionUserId: session?.user?.id,
        tokenId: token?.id
      })
    },
    async error(error) {
      console.error("[Auth] Error event:", error)
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
}