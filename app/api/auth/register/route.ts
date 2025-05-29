import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    console.log("[Register API] Incoming registration request")
    const { email, password, name } = await request.json()
    console.log("[Register API] Received data:", JSON.stringify({ email, name, passwordProvided: !!password }, null, 2))

    if (!email || !password) {
      console.log("[Register API] Missing email or password")
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    console.log("[Register API] Checking if user already exists with email:", email)
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    console.log("[Register API] Existing user query result:", existingUser ? "User found" : "No user found")

    if (existingUser) {
      console.log("[Register API] User already exists, returning error")
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    console.log("[Register API] Hashing password")
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("[Register API] Password hashed successfully")

    // Create user
    console.log("[Register API] Creating new user")
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    })
    console.log("[Register API] User created successfully with ID:", user.id)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    console.log("[Register API] Registration completed successfully")
    return NextResponse.json({
      user: userWithoutPassword,
      message: "User created successfully"
    })
  } catch (error) {
    console.error("[Register API] !!! REGISTRATION ERROR !!!:", error)
    console.error("[Register API] Error Name:", error instanceof Error ? error.name : "Unknown")
    console.error("[Register API] Error Message:", error instanceof Error ? error.message : "Unknown error")
    console.error("[Register API] Error Stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("[Register API] Full error object:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}