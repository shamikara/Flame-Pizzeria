// lib/session.ts
'use server'; // Marking this file as server-only is good practice

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose'; // Use the Edge-compatible library
import { type JwtPayload } from 'jsonwebtoken';

// The UserPayload type remains the same
export interface UserPayload extends JwtPayload {
  userId: string;
  role: 'ADMIN' | 'CHEF' | 'WAITER' | 'STORE_KEEP' | 'CUSTOMER';
  email: string;
  firstName?: string;
}

// THIS IS THE CORRECTED SERVER-SIDE SESSION FUNCTION
export async function getServerSession(): Promise<UserPayload | null> {
  const token = cookies().get('token')?.value;

  if (!token || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    // We use `jwtVerify` from 'jose', which is fully async and Edge-safe
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    // The decoded payload from jose is the user object we need
    return payload as UserPayload;
  } catch (error) {
    // This will catch invalid/expired tokens
    console.error('Failed to verify session token:', error);
    return null;
  }
}


// import { cookies } from 'next/headers';
// import { verify } from 'jsonwebtoken';
// import { type JwtPayload } from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET;

// // Define a type for your JWT payload for better type-safety
// export interface UserPayload extends JwtPayload {
//   userId: string;
//   role: 'ADMIN' | 'CHEF' | 'WAITER' | 'STORE_KEEP' | 'CUSTOMER';
//   email: string;
// }

// export async function getSession(): Promise<UserPayload | null> {
//   const token = (await cookies()).get('token')?.value;

//   if (!token || !JWT_SECRET) {
//     return null;
//   }

//   try {
//     // The 'verify' function will throw an error if the token is invalid or expired
//     const decoded = verify(token, JWT_SECRET) as UserPayload;
//     return decoded;
//   } catch (error) {
//     console.error('Invalid token:', error);
//     return null;
//   }
// }