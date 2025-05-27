import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/request';
 
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
  // Match all paths except for
  // - api routes
  // - static files /_next
  // - _next/image (image optimization files)
  // - _next/data (client data files)
  // - favicon.ico, robots.txt, etc.
  matcher: ['/((?!api|_next/static|_next/image|_next/data|favicon.ico|robots.txt).*)']
};