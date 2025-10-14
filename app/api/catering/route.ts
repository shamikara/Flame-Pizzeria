import { sendEmail } from '@/lib/email';
import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const cateringRequest = await prisma.cateringrequest.create({
      data: {
        ...data,
        eventDate: new Date(data.eventDate),
        status: 'PENDING'
      }
    });

    const emailResult = await sendEmail({
      to: data.contactEmail,
      subject: 'Catering Request Received',
      template: 'catering-confirmation',
      data: {
        name: data.contactName,
        requestId: cateringRequest.id
      }
    });

    return NextResponse.json({
      success: true,
      id: cateringRequest.id,
      // Include toast data in response
      toast: {
        title: emailResult.success 
          ? 'Request Submitted' 
          : 'Email Not Sent',
        message: emailResult.success
          ? 'We\'ve received your catering request and sent a confirmation'
          : 'Request submitted but email failed',
        variant: emailResult.success ? 'success' : 'warning'
      }
    });

  } catch (error) {
    console.error('Catering request error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to submit request',
      // Error toast data
      toast: {
        title: 'Submission Failed',
        message: 'Please try again or contact support',
        variant: 'error'
      }
    }, { status: 500 });
  }
}