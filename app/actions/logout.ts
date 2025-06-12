// app/actions/logout.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logoutAction() {
  // 1. Directly access and clear the cookie on the server.
  (await cookies()).set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: -1, // Expire the cookie immediately
    path: '/',
  });

  // 2. Perform a server-side redirect.
  // This ensures the new page is rendered *after* the cookie is cleared.
  redirect('/login');
}