import { NextRequest, NextResponse } from 'next/server';

// This middleware handles locale detection via cookies without URL routing.
// It ensures the NEXT_LOCALE cookie is set for the application.
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Check if the locale cookie exists, if not set it to default
  const currentLocale = request.cookies.get('NEXT_LOCALE')?.value;
  
  if (!currentLocale) {
    response.cookies.set('NEXT_LOCALE', 'en', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax'
    });
  }
  
  return response;
}

export const config = {
  // Match all paths except for assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};