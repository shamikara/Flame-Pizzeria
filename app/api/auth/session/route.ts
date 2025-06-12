// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';

export async function GET() {
  // We make this route dynamic to prevent caching
  // This is another layer of protection against stale data
  const dynamic = 'force-dynamic';

  // `getServerSession` is now async, so we must await it
  const session = await getServerSession();

  if (!session) {
    // If no session, return a clear error
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // If session exists, return the full user object
  return NextResponse.json({ user: session });
}