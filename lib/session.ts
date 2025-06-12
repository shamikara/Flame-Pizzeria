// lib/session.ts

import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { type JwtPayload } from 'jsonwebtoken';

// 1. This is the single source of truth for your user session's shape.
export interface UserPayload extends JwtPayload {
  userId: string;
  role: 'ADMIN' | 'CHEF' | 'WAITER' | 'STORE_KEEP' | 'CUSTOMER';
  email: string;
  firstName?: string; // Make sure this is included
}

// 2. This is the function for SERVER-SIDE use (Server Actions, API Routes, Server Components)
export async function getServerSession(): Promise<UserPayload | null> { 
  const token = (await cookies()).get('token')?.value;

  if (!token || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    // The 'verify' function will throw an error if the token is invalid or expired
    const decoded = verify(token, process.env.JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    // This will handle cases of invalid or expired tokens gracefully
    console.error('Invalid token in getServerSession:', error);
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