import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

const COOKIE_NAME = 'token'; 

export async function GET() {
  const serializedCookie = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: -1,
    path: '/',
  });

  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  // Attach the "expired" cookie header to the response
  response.headers.set('Set-Cookie', serializedCookie);

  return response;
}