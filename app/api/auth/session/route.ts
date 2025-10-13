// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import prisma from '@/lib/db';

export async function GET() {
  const dynamic = 'force-dynamic';

  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Fetch full user details from database
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        address: true,
        contact: true,
      }
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Return user with all details
    return NextResponse.json({ 
      user: {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        address: user.address,
        phone: user.contact,
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json({ user: session }, { status: 200 });
  }
}