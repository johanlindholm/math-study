'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;

    // Set the cookie and refresh to apply the new locale
    document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000`;
    router.refresh();
  };

  return (
    <select 
      value={locale}
      onChange={handleChange}
      className="p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <option value="en">English</option>
      <option value="es">Español</option>
      <option value="de">Deutsch</option>
    </select>
  );
}