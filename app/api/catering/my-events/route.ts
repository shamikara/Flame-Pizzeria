import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import prisma from '@/lib/db';

type EventCateringResponse = {
  id: number;
  eventType: string;
  eventDate: Date;
  guestCount: number;
  status: string;
  totalAmount: number | null;
  depositAmount: number | null;
  paymentStatus: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all catering requests for the current user
    const events = await prisma.cateringrequest.findMany({
      where: {
        userId: session.userId,
      },
      select: {
        id: true,
        eventType: true,
        eventDate: true,
        guestCount: true,
        status: true,
        totalAmount: true,
        depositAmount: true,
        paymentStatus: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        eventDate: 'asc', // Show upcoming events first
      },
    });

    // Map to the expected response format
    const formattedEvents = events.map(event => ({
      ...event,
      depositPaid: event.paymentStatus === 'COMPLETED' && (event.depositAmount || 0) > 0,
    }));

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching user events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
