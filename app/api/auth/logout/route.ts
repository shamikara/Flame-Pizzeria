import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

const COOKIES_TO_CLEAR = [
  'token',
  'session',
  'session.sig',
  'next-auth.session-token',
  'next-auth.csrf-token',
  'next-auth.callback-url',
  'next-auth.csrf-token',
  '__Secure-next-auth.session-token',
  '__Host-next-auth.csrf-token',
  '__Secure-next-auth.callback-url',
];

export async function POST() {
  // Create headers with all cookies to clear
  const headers = new Headers();
  
  // Add headers to clear all known auth cookies
  COOKIES_TO_CLEAR.forEach(cookieName => {
    headers.append(
      'Set-Cookie',
      serialize(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: -1,
        path: '/',
        expires: new Date(0),
      })
    );
  });

  // Create response with success message
  const response = new NextResponse(
    JSON.stringify({
      success: true,
      message: 'Logged out successfully. All sessions cleared.',
    }),
    {
      status: 200,
      headers,
    }
  );

  return response;
}