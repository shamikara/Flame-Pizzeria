import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // This line correctly looks for the cookie we are now setting!
  const token = request.cookies.get('token')?.value;

  // The path you are protecting might be /dashboard, not /admin. Adjust if needed.
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');

  // If trying to access a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is logged in and tries to go to /login, redirect them away
  if (token && request.nextUrl.pathname.startsWith('/login')) {
     return NextResponse.redirect(new URL('/dashboard/overview', request.url));
  }


  return NextResponse.next();
}

// Add all protected routes to the matcher
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};