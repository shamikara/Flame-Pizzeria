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
//-------------------------------
// middleware.ts -new add

// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { type UserPayload } from '@/lib/session'; // Import our new type

const JWT_SECRET = process.env.JWT_SECRET;

// Define allowed paths for each role
const rolePermissions: Record<UserPayload['role'], string[]> = {
  ADMIN: ['/dashboard/overview', '/dashboard/orders', '/dashboard/foods', '/dashboard/employees', '/dashboard/users', '/dashboard/raw-materials', '/dashboard/reports', '/dashboard/profile'],
  CHEF: ['/dashboard/orders', '/dashboard/foods', '/dashboard/profile'],
  WAITER: ['/dashboard/orders', '/dashboard/foods', '/dashboard/profile'],
  STORE_KEEPER: ['/dashboard/raw-materials', '/dashboard/profile'],
  CUSTOMER: [], // Customers have no access to any dashboard pages
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // --- Check for token and JWT_SECRET ---
  if (!token || !JWT_SECRET) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // --- Verify the token ---
    const user = verify(token, JWT_SECRET) as UserPayload;

    // --- Role-based access control ---
    const userRole = user.role;

    // 1. Kick out customers immediately
    if (userRole === 'CUSTOMER') {
        // You might want to log them out or just redirect them to the homepage/shop
        return NextResponse.redirect(new URL('/shop', request.url));
    }
    
    // 2. Check if the user's role allows access to the requested path
    // We check if the pathname starts with any of the allowed paths for that role.
    const allowedPaths = rolePermissions[userRole] || [];
    const hasAccess = allowedPaths.some(path => pathname.startsWith(path));

    if (!hasAccess) {
        // If they don't have access, redirect them to a default page for their role
        let defaultUrl = '/login'; // Fallback
        if (userRole === 'ADMIN') defaultUrl = '/dashboard/overview';
        if (userRole === 'CHEF' || userRole === 'WAITER') defaultUrl = '/dashboard/orders';
        if (userRole === 'STORE_KEEPER') defaultUrl = '/dashboard/raw-materials';
        
        return NextResponse.redirect(new URL(defaultUrl, request.url));
    }

    // --- If all checks pass, allow the request to continue ---
    return NextResponse.next();

  } catch (error) {
    // --- Handle invalid/expired token ---
    console.log('Token verification failed, redirecting to login.');
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// --- Configure the middleware to run only on dashboard routes ---
export const config = {
  matcher: '/dashboard/:path*',
};
