import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from '@/lib/session';

// For dynamic route rendering
export const dynamic = 'force-dynamic';

// GET /api/catering/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Await the params promise to resolve before accessing its properties
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (id === null) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    const cateringRequest = await prisma.cateringrequest.findUnique({
      where: { id },
    });

    if (!cateringRequest) {
      return NextResponse.json({ error: 'Catering request not found' }, { status: 404 });
    }

    // The menuItems field is a JSON blob, so we need to parse it.
    const menuItemsData = cateringRequest.menuItems as any;

    // Format the response to match what the checkout page expects
    const responseData = {
      id: cateringRequest.id,
      depositAmount: menuItemsData.depositDue,
      totalAmount: menuItemsData.total,
      status: cateringRequest.status,
      eventType: cateringRequest.eventType,
      eventDate: cateringRequest.eventDate,
      guestCount: cateringRequest.guestCount,
      contactName: cateringRequest.contactName,
      contactEmail: cateringRequest.contactEmail,
      contactPhone: cateringRequest.contactPhone,
    };

    return NextResponse.json({ data: responseData });
  } catch (error) {
    console.error('Error in GET /api/catering/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/catering/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const { status } = await request.json();

    if (id === null) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    await prisma.cateringrequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PATCH /api/catering/[id]:', error);
    return NextResponse.json({ error: 'Failed to update catering request' }, { status: 500 });
  }
}
