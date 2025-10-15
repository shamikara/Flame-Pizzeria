import { sendEmail } from '@/lib/email';
import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

const MIN_GUESTS = 9;
const MAX_GUESTS = 101;
const MIN_LEAD_DAYS = 5;

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const guestCount = Number(data.guestCount);
    const eventDate = new Date(data.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!Number.isFinite(guestCount) || guestCount < MIN_GUESTS || guestCount > MAX_GUESTS) {
      return NextResponse.json(
        {
          success: false,
          error: `Guest count must be between ${MIN_GUESTS} and ${MAX_GUESTS}.`,
          toast: {
            title: 'Invalid guest count',
            message: `Please enter between ${MIN_GUESTS} and ${MAX_GUESTS} guests.`,
            variant: 'error',
          },
        },
        { status: 400 }
      );
    }

    if (Number.isNaN(eventDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid event date provided.',
          toast: {
            title: 'Invalid date',
            message: 'Please select a valid event date.',
            variant: 'error',
          },
        },
        { status: 400 }
      );
    }

    eventDate.setHours(0, 0, 0, 0);
    const millisPerDay = 1000 * 60 * 60 * 24;
    const dayDiff = (eventDate.getTime() - today.getTime()) / millisPerDay;
    if (dayDiff < MIN_LEAD_DAYS) {
      return NextResponse.json(
        {
          success: false,
          error: `Event date must be at least ${MIN_LEAD_DAYS} days from today.`,
          toast: {
            title: 'Date too soon',
            message: `Please choose a date at least ${MIN_LEAD_DAYS} days in advance.`,
            variant: 'error',
          },
        },
        { status: 400 }
      );
    }
    
    const cateringRequest = await prisma.cateringrequest.create({
      data: {
        ...data,
        guestCount,
        eventDate,
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