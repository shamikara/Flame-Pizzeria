import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { stripe, formatAmountForStripe } from "@/lib/stripe";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface MenuItemsData {
  items: MenuItem[];
  subtotal: number;
  tax: number;
  depositPercentage: number;
  depositDue: number;
  total: number;
  [key: string]: any;
}

interface CateringRequest {
  id: number;
  menuItems: unknown;
  status?: string;
  [key: string]: any;
}

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

    // Validate requestId
    if (!requestId || isNaN(parseInt(requestId))) {
      return NextResponse.json({
        error: "Valid request ID is required"
      }, { status: 400 });
    }

    const requestIdNum = parseInt(requestId);

    // Find the catering request with proper error handling
    const cateringRequest = await prisma.cateringrequest.findUnique({
      where: { id: requestIdNum }
    }) as CateringRequest | null;

    if (!cateringRequest) {
      return NextResponse.json({
        error: `Catering request with ID ${requestId} not found`
      }, { status: 404 });
    }

    // Check if payment already exists and its status
    const existingPayment = await prisma.payment.findFirst({
      where: { orderId: requestIdNum }
    });

    if (existingPayment) {
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

      // Delete existing payment record to allow retry
      await prisma.payment.delete({
        where: { id: existingPayment.id }
      });
    }

    // Safely parse menu items with type checking
    const menuItems = cateringRequest.menuItems as MenuItemsData;
    
    // Validate menu items structure
    if (!menuItems || typeof menuItems !== 'object') {
      console.error('Invalid menu items data:', menuItems);
      return NextResponse.json({
        error: "Invalid menu items data"
      }, { status: 400 });
    }

    const { depositDue, total } = menuItems;
    
    // Validate deposit amount
    if (typeof depositDue !== 'number' || depositDue <= 0) {
      console.error('Invalid deposit amount:', { depositDue, menuItems });
      return NextResponse.json({
        error: "Invalid deposit amount",
        details: {
          depositDue,
          hasMenuItems: !!menuItems,
          menuItemsType: typeof menuItems
        }
      }, { status: 400 });
    }

    // Log relevant information for debugging
    console.log('Processing payment for catering request:', {
      requestId: requestIdNum,
      depositDue,
      total,
      hasMenuItems: !!(menuItems?.items?.length > 0)
    });

    try {
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: formatAmountForStripe(depositDue, 'lkr'),
        currency: 'lkr',
        metadata: {
          requestId: requestIdNum.toString(),
          type: 'catering_deposit',
          userId: session.user?.id || 'unknown'
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Create payment record in database
      await prisma.payment.create({
        data: {
          amount: depositDue,
          method: 'CARD',
          status: 'PENDING',
          transactionId: paymentIntent.id,
          orderId: requestIdNum // Directly set orderId since we can't use connect with orderId being optional
        },
      });

      return NextResponse.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: depositDue,
        currency: 'LKR',
      });
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      return NextResponse.json({
        error: "Failed to create payment intent",
        details: stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error("[CATERING_CHECKOUT_ERROR]", error);
    
    // More detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json({
      error: "Failed to process checkout",
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }
}
