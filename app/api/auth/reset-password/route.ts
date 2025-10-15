import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    
    // 1. Verify token exists and isn't expired
    const resetRequest = await prisma.passwordreset.findUnique({
      where: { token }
    });

    if (!resetRequest || resetRequest.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // 2. Update user password
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email: resetRequest.email },
      data: { password: hashedPassword }
    });

    // 3. Delete used token
    await prisma.passwordreset.delete({ where: { token } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}