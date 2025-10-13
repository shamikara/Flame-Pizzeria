import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { status } = await request.json();
  
  await prisma.cateringRequest.update({
    where: { id: params.id },
    data: { status }
  });

  return NextResponse.json({ success: true });
}