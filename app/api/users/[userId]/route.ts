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
    const requestedUserId = params.userId;

    if (!session || session.userId !== requestedUserId) {
      return new NextResponse('Unauthorized', { status: 401 });
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
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[USER_GET_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}