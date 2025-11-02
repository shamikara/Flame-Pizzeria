import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "@/lib/session";
import prisma from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, );

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized - User not authenticated" },
        { status: 401 }
      );
    }

    // Read the request body only ONCE
    const body = await req.json();
    const { orderId, amount, metadata = {} } = body;

    if (!orderId || amount === undefined) {
      return NextResponse.json(
        { error: "Order ID and amount are required" },
        { status: 400 }
      );
    }

    // Verify the order exists and belongs to the user
    const order = await prisma.cateringrequest.findUnique({
      where: { id: parseInt(orderId) },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.userId !== session.userId) {
      return NextResponse.json(
        { error: "Unauthorized - You don't have permission to access this order" },
        { status: 403 }
      );
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      // Stripe expects the amount in the smallest currency unit (cents for LKR)
      amount: Math.round(amount * 100),
      currency: "lkr", // Use LKR to be consistent with the rest of the application
      description: `Deposit for Event Catering Order #${orderId}`,
      metadata: {
        orderId: orderId.toString(),
        orderType: "event_catering",
        userId: session.userId.toString(),
        ...metadata, // Include any additional metadata from the client
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: orderId,
      amount: amount,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { 
        error: "Failed to create payment intent",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
