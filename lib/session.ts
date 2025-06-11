// import { cookies } from 'next/headers';
// import { verify } from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET!;
// const COOKIE_NAME = 'token';

// interface UserPayload {
//   userId: string;
//   role: string;
//   email: string;
//   iat: number;
//   exp: number;
// }

// export async function getServerSession() {
//   const cookieStore = await cookies();
//   const token = cookieStore.get(COOKIE_NAME)?.value;

//   if (!token) {
//     return null;
//   }

//   try {
//     const payload = verify(token, JWT_SECRET) as UserPayload;
//     return payload;
//   } catch (error) {
//     // Token is invalid or expired
//     return null;
//   }
// }
//-----------------------------
// lib/session.ts -new add


import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { type JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// Define a type for your JWT payload for better type-safety
export interface UserPayload extends JwtPayload {
  userId: string;
  role: 'ADMIN' | 'CHEF' | 'WAITER' | 'STORE_KEEPER' | 'CUSTOMER';
  email: string;
}

export function getSession(): UserPayload | null {
  const token = cookies().get('token')?.value;

  if (!token || !JWT_SECRET) {
    return null;
  }

  try {
    // The 'verify' function will throw an error if the token is invalid or expired
    const decoded = verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}