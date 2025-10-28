import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || !session.roles?.includes('ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const reviews = await prisma.rating.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        foodItem: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending reviews' },
      { status: 500 }
    );
  }
}
