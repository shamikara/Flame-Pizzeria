import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    // Verify user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: 'If this email exists, a reset link will be sent' },
        { status: 200 } // Don't reveal if user exists
      );
    }

    // Create/update reset token (expires in 1 hour)
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 3600000);
    
    await prisma.passwordReset.upsert({
      where: { email },
      update: { token, expiresAt },
      create: { email, token, expiresAt }
    });

    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}