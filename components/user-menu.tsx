"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export default function UserMenu() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="text-sm text-gray-500">Loading...</div>
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">
          {session.user?.email}
        </span>
        <button
          onClick={() => signOut()}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/auth/signin"
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Sign in
      </Link>
      <Link
        href="/auth/signup"
        className="text-sm font-medium text-blue-600 hover:text-blue-500"
      >
        Sign up
      </Link>
    </div>
  )
}