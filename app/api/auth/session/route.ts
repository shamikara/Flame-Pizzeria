// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';

export async function GET() {
  // getSession() reads the cookie on the server-side
  const session = getServerSession();

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user: session });
}