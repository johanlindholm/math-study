import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {locales, defaultLocale} from '../i18n';

// Re-export locales and defaultLocale for use in other files
export {locales, defaultLocale};
 
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();
 
  return {
    locale: locale || defaultLocale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});