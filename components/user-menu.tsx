"use client"

import { useSession, signOut } from "next-auth/react"
import { Link } from '@/navigation'
import { LanguageSwitcher } from "./language-switcher"
import { useTranslations } from 'next-intl'

export default function UserMenu() {
  const { data: session, status } = useSession()
  const t = useTranslations('common')

  if (status === "loading") {
    return <div className="text-sm text-gray-500">{t('loading')}</div>
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <span className="text-sm text-gray-700">
          {session.user?.email}
        </span>
        <button
          onClick={() => signOut()}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {t('signOut')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <LanguageSwitcher />
      <Link
        href="/auth/signin"
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        {t('signIn')}
      </Link>
      <Link
        href="/auth/signup"
        className="text-sm font-medium text-blue-600 hover:text-blue-500"
      >
        {t('signUp')}
      </Link>
    </div>
  )
}