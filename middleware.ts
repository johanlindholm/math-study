import createMiddleware from 'next-intl/middleware';

// This middleware is responsible for internationalization but does NOT handle routing.
// It detects the locale and sets a cookie.
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es', 'de'],

  // Used when no locale matches
  defaultLocale: 'en'
});

export const config = {
  // Match all paths except for assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};