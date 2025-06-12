// import { NextResponse } from 'next/server';
// import { comparePassword } from '@/lib/auth';
// import { sign } from 'jsonwebtoken';
// import { serialize } from 'cookie';
// import db from '@/lib/db';

// // Define constants for cookie handling
// const JWT_SECRET = process.env.JWT_SECRET;
// const COOKIE_NAME = 'token'; // The name of the cookie your middleware will look for

// export async function POST(request: Request) {
//   // Check if JWT_SECRET is set
//   if (!JWT_SECRET) {
//     console.error('JWT_SECRET is not set in environment variables.');
//     return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
//   }

//   try {
//     const { email, password } = await request.json();

//     // Get user by email
//     const user = await db.user.findUnique({
//       where: { email },
//     });

//     if (!user) {
//       return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
//     }

//     const isValid = await comparePassword(password, user.password);

//     if (!isValid) {
//       return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
//     }

//     // --- NEW SESSION LOGIC ---
//     // 1. Create the payload for the token. Include essential, non-sensitive data.
//     const payload = {
//       userId: user.id,
//       role: user.role,
//       email: user.email,
//     };

//     // 2. Sign the token with your secret, setting an expiration time.
//     const token = sign(payload, JWT_SECRET, {
//       expiresIn: '7d', // Token will be valid for 7 days
//     });

//     // 3. Serialize the cookie to be set in the browser.
//     const serializedCookie = serialize(COOKIE_NAME, token, {
//       httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
//       secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
//       sameSite: 'strict', // Helps prevent CSRF attacks
//       maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
//       path: '/', // The cookie is available for all paths on your domain
//     });

//     // 4. Create the JSON response body, including the user's role for the redirect logic.
//     const responseBody = {
//       success: true,
//       user: {
//         id: user.id,
//         email: user.email,
//         firstName: user.firstName,
//         role: user.role, // <-- Important: for the form to decide where to redirect
//       },
//     };
    
//     // 5. Create the final response and attach the 'Set-Cookie' header.
//     const response = NextResponse.json(responseBody);
//     response.headers.set('Set-Cookie', serializedCookie);

//     return response;

//   } catch (error) {
//     console.error('Login error:', error);
//     return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
//   }
// }
// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { comparePassword } from '@/lib/auth';
import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';
import db from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'token';

export async function POST(request: Request) {
  console.log('--- LOGIN ATTEMPT RECEIVED ---');

  if (!JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is not set in environment variables.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }
  console.log('✅ JWT_SECRET is present.');

  try {
    const { email, password } = await request.json();
    console.log(`Attempting login for email: ${email}`);

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      console.log('❌ User not found in database.');
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    console.log(`✅ User found: ${user.id}, Role: ${user.role}`);

    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      console.log('❌ Password comparison failed.');
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    console.log('✅ Password is valid.');

    const payload = { userId: user.id, role: user.role, email: user.email };
    console.log('JWT Payload to be signed:', payload);

    const token = sign(payload, JWT_SECRET, { expiresIn: '7d' });
    console.log(`✅ Token signed successfully. Token starts with: ${token.substring(0, 15)}...`);

    const serializedCookie = serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    console.log('✅ Cookie serialized successfully.');

    const responseBody = {
      success: true,
      user: { id: user.id, email: user.email, firstName: user.firstName, role: user.role },
    };
    
    const response = NextResponse.json(responseBody);
    response.headers.set('Set-Cookie', serializedCookie);
    console.log('✅ Sending successful response with Set-Cookie header.');
    
    return response;

  } catch (error) {
    console.error('❌ UNEXPECTED ERROR in login route:', error);
    return NextResponse.json({ error: 'Failed to login due to an internal error' }, { status: 500 });
  }
}