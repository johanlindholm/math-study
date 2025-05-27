import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
 
// Can be imported from a shared config
export const locales = ['en', 'sv'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale = 'en';
 
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();
 
  return {
    locale: locale || defaultLocale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});