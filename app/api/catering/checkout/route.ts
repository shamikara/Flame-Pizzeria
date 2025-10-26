import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { stripe, formatAmountForStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({
        error: "Authentication required",
        requiresLogin: true
      }, { status: 401 });
    }

    const { requestId } = await request.json();

    if (!requestId) {
      return NextResponse.json({
        error: "Request ID is required"
      }, { status: 400 });
    }

    // Find the catering request
    const cateringRequest = await prisma.cateringrequest.findUnique({
      where: { id: parseInt(requestId) }
    });

    if (!cateringRequest) {
      return NextResponse.json({
        error: "Catering request not found"
      }, { status: 404 });
    }

    // Check if payment already exists and its status
    const existingPayment = await prisma.payment.findFirst({
      where: { orderId: parseInt(requestId) }
    });

    if (existingPayment) {
      // Allow retries for failed or pending payments
      if (existingPayment.status === 'COMPLETED') {
        return NextResponse.json({
          error: "Payment has already been completed for this request",
          details: {
            paymentId: existingPayment.id,
            amount: existingPayment.amount,
            completedAt: existingPayment.createdAt,
            status: existingPayment.status
          }
        }, { status: 400 });
      }

      // For failed or pending payments, delete the old payment record to allow retry
      await prisma.payment.delete({
        where: { id: existingPayment.id }
      });
    }

    // Get the totals from the stored data
    const menuItems = cateringRequest.menuItems as any;
    const totals = menuItems?.totals;
    const depositDue = menuItems?.depositDue;

    if (!totals || !depositDue || depositDue <= 0) {
      return NextResponse.json({
        error: "Invalid payment amount"
      }, { status: 400 });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(depositDue, 'lkr'),
      currency: 'lkr',
      metadata: {
        requestId: requestId.toString(),
        type: 'catering_deposit'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create payment record in database
    await prisma.payment.create({
      data: {
        orderId: parseInt(requestId), // Using orderId temporarily until schema migration
        amount: depositDue,
        status: 'PENDING',
        method: 'CARD',
        transactionId: paymentIntent.id, // Store payment intent ID for webhook handling
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: depositDue,
      currency: 'LKR',
    });

  } catch (error) {
    console.error("[CATERING_CHECKOUT_ERROR]", error);
    return NextResponse.json({
      error: "Internal Server Error"
    }, { status: 500 });
  }
}
