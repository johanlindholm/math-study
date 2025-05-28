import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

// This file is responsible for loading translation messages and configuring internationalization
// for server-side rendering (SSR) and server components.
export default getRequestConfig(async () => {
  // Determine the locale from a cookie, defaulting to 'en'
  const locale = (await cookies()).get('NEXT_LOCALE')?.value ?? 'en';

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});