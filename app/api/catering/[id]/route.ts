import prisma from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({
        error: "Authentication required"
      }, { status: 401 });
    }

    const cateringRequest = await prisma.cateringrequest.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!cateringRequest) {
      return NextResponse.json({
        error: "Catering request not found"
      }, { status: 404 });
    }

    return NextResponse.json(cateringRequest);
  } catch (error) {
    console.error('Error fetching catering request:', error);
    return NextResponse.json({
      error: "Internal Server Error"
    }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { status } = await request.json();
  
  await prisma.cateringrequest.update({
    where: { id: parseInt(params.id) },
    data: { status }
  });

  return NextResponse.json({ success: true });
}