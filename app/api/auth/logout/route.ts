import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

const COOKIE_NAME = 'token'; 

// Change GET to POST to match the request from your header
export async function POST() {
  // The logic to clear the cookie is to set its value to empty and its maxAge to -1
  const serializedCookie = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: -1, // This tells the browser to expire the cookie immediately
    path: '/',
  });

  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  // Attach the "expired" cookie header to the response to clear it from the browser
  response.headers.set('Set-Cookie', serializedCookie);

  return response;
}