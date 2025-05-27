'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useRouter } from '@/navigation';
import { useTransition } from 'react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    startTransition(() => {
      // Get the pathname without the locale
      const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
      router.push(pathWithoutLocale, { locale: newLocale });
    });
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => switchLocale('en')}
        disabled={isPending || locale === 'en'}
        className={`px-3 py-1 rounded ${
          locale === 'en' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        } transition-colors`}
      >
        EN
      </button>
      <button
        onClick={() => switchLocale('sv')}
        disabled={isPending || locale === 'sv'}
        className={`px-3 py-1 rounded ${
          locale === 'sv' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        } transition-colors`}
      >
        SV
      </button>
    </div>
  );
}