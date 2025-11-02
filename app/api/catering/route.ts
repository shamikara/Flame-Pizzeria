import { sendEmail } from '@/lib/email';
import prisma from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';

const MIN_GUESTS = 25;
const MAX_GUESTS = 150;
const MIN_LEAD_DAYS = 6;

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();

    const {
      eventType,
      eventDate: eventDateRaw,
      guestCount: guestCountRaw,
      contactName,
      contactEmail,
      menuItems,
      specialRequests,
      billSnapshot,
      ...unknownFields
    } = requestBody;

    // Ensure we don't silently drop unexpected fields without logging for debugging
    if (Object.keys(unknownFields).length > 0) {
      console.debug('[CATERING_REQUEST] Ignored extra fields:', Object.keys(unknownFields));
    }

    const session = await getServerSession();
    const userId = session?.userId ?? null;

    const guestCount = Number(guestCountRaw);
    const eventDate = new Date(eventDateRaw);

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
    
    const quoteSubtotal = billSnapshot?.subtotal ?? null;
    const quoteServiceCharge = billSnapshot?.serviceCharge ?? null;
    const quoteTax = billSnapshot?.tax ?? null;
    const quoteTotal = billSnapshot?.total ?? null;
    const depositDue = quoteTotal != null ? Number((quoteTotal * 0.25).toFixed(2)) : null;

    // Ensure we have a valid user ID
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User authentication required',
          toast: {
            title: 'Authentication required',
            message: 'Please sign in to submit a catering request',
            variant: 'error',
          },
        },
        { status: 401 }
      );
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!userExists) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          toast: {
            title: 'User not found',
            message: 'The specified user account could not be found',
            variant: 'error',
          },
        },
        { status: 404 }
      );
    }

    let cateringRequest;
    try {
      cateringRequest = await prisma.cateringrequest.create({
      data: {
        userId: userId,
        eventType,
        eventDate,
        guestCount,
        contactName,
        contactEmail,
        menuItems: {
          ...menuItems,
          // Store the calculated totals in the menuItems JSON field
          totals: billSnapshot
            ? {
                subtotal: quoteSubtotal,
                serviceCharge: quoteServiceCharge,
                tax: quoteTax,
                total: quoteTotal,
              }
            : null,
          depositDue,
        },
        specialRequests: specialRequests || '',
        status: 'PENDING',
        totalAmount: quoteTotal ? Number(quoteTotal) : null,
        depositAmount: depositDue,
      },
    });
    } catch (error) {
      console.error('Error creating catering request:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create catering request',
          details: errorMessage,
          toast: {
            title: 'Error',
            message: 'Failed to submit catering request. Please try again.',
            variant: 'error',
          },
        },
        { status: 500 }
      );
    }

    const emailResult = await sendEmail({
      to: contactEmail,
      subject: 'Catering Request Received',
      template: 'catering-confirmation',
      data: {
        name: contactName,
        requestId: cateringRequest.id,
        eventDate: eventDate.toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        guestCount,
        billSnapshot: billSnapshot ?? undefined
      }
    });

    const responseData = {
      success: true,
      id: cateringRequest.id,
      status: cateringRequest.status,
      totals: billSnapshot
        ? {
            subtotal: quoteSubtotal,
            serviceCharge: quoteServiceCharge,
            tax: quoteTax,
            total: quoteTotal,
          }
        : null,
      depositDue,
      toast: {
        title: emailResult.success 
          ? 'Request Submitted' 
          : 'Email Not Sent',
        message: emailResult.success
          ? 'We\'ve received your catering request and sent a confirmation'
          : 'Request submitted but email failed',
        variant: emailResult.success ? 'success' : 'warning'
      }
    };

    return NextResponse.json(responseData);

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