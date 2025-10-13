import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from '@/lib/session';

export async function PATCH(request: Request, context: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;

    await prisma.notification.updateMany({
      where: {
        id: parseInt(id),
        userId: session.userId
      },
      data: { read: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}