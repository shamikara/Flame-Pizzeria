import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "@/lib/session";
import prisma from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized - User not authenticated" },
        { status: 401 }
      );
    }

    const { orderId, amount } = await req.json();

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

    // Extract metadata if provided
    const { metadata = {} } = await req.json();
    
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // amount in cents (includes deposit + delivery charge)
      description: `Deposit and Delivery for Event Catering Order #${orderId}`,
      metadata: {
        orderId,
        paymentType: 'deposit',
        ...metadata
      },
      currency: "usd",
      metadata: {
        orderId: orderId.toString(),
        orderType: "event_catering",
        userId: session.userId.toString(),
      },
      description: `Deposit for Event Catering Order #${orderId}`,
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
