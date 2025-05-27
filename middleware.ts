import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales,
 
  // Used when no locale matches
  defaultLocale,
  
  // Automatically redirect to the best matching locale
  localeDetection: true,
  
  // Prefix the locale to all pathnames
  localePrefix: 'always'
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};