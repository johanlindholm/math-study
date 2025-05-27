'use client';

import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

export default function AuthError() {
  const t = useTranslations('common');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t('error')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            An error occurred during authentication.
          </p>
          <Link
            href="/auth/signin"
            className="mt-4 inline-block font-medium text-indigo-600 hover:text-indigo-500"
          >
            Return to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}