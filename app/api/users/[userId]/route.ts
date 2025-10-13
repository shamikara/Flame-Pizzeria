// app/api/users/[userId]/route.ts

import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getServerSession } from '@/lib/session';

// THIS IS THE FIX:
// It forces the route to be dynamic and prevents static optimization.
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession();
    const requestedUserId = parseInt(params.userId);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is requesting their own data
    if (session.userId !== requestedUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const user = await db.user.findUnique({
      where: { id: requestedUserId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        contact: true,
        address: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[USER_GET_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}