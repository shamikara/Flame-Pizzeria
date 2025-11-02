import prisma from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';

// For dynamic route rendering
export const dynamic = 'force-dynamic';

// Helper: safely extract ID
function getIdFromParams(id: string | string[] | undefined): number | null {
  if (!id) return null;
  const parsedId = Array.isArray(id) ? id[0] : id;
  const numId = parseInt(parsedId);
  return isNaN(numId) ? null : numId;
}

// GET /api/catering/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string | string[] } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // ✅ Fix: pass params.id, not params
    const id = getIdFromParams(params.id);
    if (id === null) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    const cateringRequest = await prisma.cateringrequest.findUnique({
      where: { id },
    });

    if (!cateringRequest) {
      return NextResponse.json({ error: 'Catering request not found' }, { status: 404 });
    }

    return NextResponse.json(cateringRequest);
  } catch (error) {
    console.error('Error in GET /api/catering/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/catering/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string | string[] } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { status } = await request.json();

    // ✅ Fix: pass params.id, not params
    const id = getIdFromParams(params.id);
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
