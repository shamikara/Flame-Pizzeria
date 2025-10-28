import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || !session.roles?.includes('ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { status, adminComment } = await request.json();
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const review = await prisma.rating.update({
      where: { id: parseInt(params.id) },
      data: {
        status,
        adminComment,
        reviewedAt: new Date(),
        reviewedById: session.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        foodItem: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error updating review status:', error);
    return NextResponse.json(
      { error: 'Failed to update review status' },
      { status: 500 }
    );
  }
}
