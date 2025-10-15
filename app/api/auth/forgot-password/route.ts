import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { message: 'If this email exists, a reset link will be sent.' },
        { status: 200 }
      );
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 3600000);

    await prisma.passwordreset.upsert({
      where: { email },
      update: { token, expiresAt },
      create: { email, token, expiresAt }
    });

    const baseUrl =
      process.env.APP_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      request.headers.get('origin') ??
      'http://localhost:3000';

    const resetLink = new URL(`/reset-password?token=${token}`, baseUrl).toString();

    const emailResult = await sendEmail({
      to: email,
      subject: 'Password Reset',
      template: 'password-reset',
      data: { resetLink }
    });

    if (!emailResult.success) {
      return NextResponse.json(
        {
          message: 'Reset link generated but email delivery failed. Please contact support.',
          error: emailResult.toastMessage
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'If this email exists, a reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}