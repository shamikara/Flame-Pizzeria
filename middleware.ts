// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//   // This line correctly looks for the cookie we are now setting!
//   const token = request.cookies.get('token')?.value;

//   // The path you are protecting might be /dashboard, not /admin. Adjust if needed.
//   const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');

//   // If trying to access a protected route without a token, redirect to login
//   if (isProtectedRoute && !token) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   // If user is logged in and tries to go to /login, redirect them away
//   if (token && request.nextUrl.pathname.startsWith('/login')) {
//      return NextResponse.redirect(new URL('/dashboard/overview', request.url));
//   }


//   return NextResponse.next();
// }

// // Add all protected routes to the matcher
// export const config = {
//   matcher: ['/dashboard/:path*', '/login'],
// };
//-------------------------------// middleware.ts// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// --- STEP 1: Import from 'jose' instead of 'jsonwebtoken' ---
import { jwtVerify } from 'jose';
import { type UserPayload } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET;
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  console.log(`--- MIDDLEWARE TRIGGERED FOR: ${pathname} ---`);
  
  if (!JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is not available in the middleware.');
    return NextResponse.redirect(new URL('/login?error=server_config', request.url));
  }
  if (!token) {
    console.log('Middleware: No token found. Redirecting to login.');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  console.log('Middleware: Token found.');

  try {
    // --- STEP 2: Use `jwtVerify` which is Edge-compatible ---
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret) as { payload: UserPayload };
    
    console.log(`Middleware: Token verified successfully for role: ${payload.role}`);

    const userRole = payload.role;
    if (userRole === 'CUSTOMER') {
      return NextResponse.redirect(new URL('/shop', request.url));
    }
    
    const rolePermissions: Record<UserPayload['role'], string[]> = {
        ADMIN: ['/dashboard/overview', '/dashboard/orders', '/dashboard/foods', '/dashboard/customizations', '/dashboard/employees', '/dashboard/users', '/dashboard/ingredients', '/dashboard/reports', '/dashboard/profile'],
        MANAGER: ['/dashboard/overview', '/dashboard/orders', '/dashboard/foods', '/dashboard/customizations', '/dashboard/employees', '/dashboard/users', '/dashboard/ingredients', '/dashboard/reports', '/dashboard/profile'],
        CHEF: ['/dashboard/orders', '/dashboard/foods', '/dashboard/customizations', '/dashboard/profile'],
        WAITER: ['/dashboard/orders', '/dashboard/foods', '/dashboard/profile'],
        STORE_KEEP: ['/dashboard/ingredients', '/dashboard/profile'],
        CUSTOMER: [],
    };

    const allowedPaths = rolePermissions[userRole] || [];
    const hasAccess = allowedPaths.some(path => pathname.startsWith(path));

    if (!hasAccess) {
      console.log(`Middleware: Access DENIED for role ${userRole} to path ${pathname}.`);
      let defaultUrl = '/dashboard/overview';
      if (userRole === 'CHEF' || userRole === 'WAITER') defaultUrl = '/dashboard/orders';
      if (userRole === 'STORE_KEEP') defaultUrl = '/dashboard/ingredients';
      return NextResponse.redirect(new URL(defaultUrl, request.url));
    }

    console.log(`Middleware: Access GRANTED for role ${userRole} to path ${pathname}.`);
    return NextResponse.next();

  } catch (error) {
    // This will catch invalid tokens (e.g., expired, malformed)
    console.error('Middleware: JWT verification failed!', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Your matcher config remains the same and is correct.
export const config = {
  /*
   * Match all request paths under /dashboard, EXCEPT for the ones that are:
   * - for API routes
   * - for Next.js static files (_next/static)
   * - for Next.js image optimization files (_next/image)
   * - for the favicon
   * - or any other files inside /public that have an extension (e.g., .png, .jpg, .svg)
   */
  matcher: [
    '/dashboard/:path*',
  ],
  // This is an experimental flag to ensure middleware runs only on pages
  // and not on asset requests, which is exactly what we want.
  unstable_allowDynamic: [
    '/node_modules/function-bind/**', // Recommended for some dependencies
    '/node_modules/next/dist/build/webpack/loaders/next-swc-loader.js', // Recommended
  ],
};