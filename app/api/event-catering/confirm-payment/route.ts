import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const POST = async (req: Request) => {
  try {
    const { requestId, paymentIntentId } = await req.json();

    if (!requestId || !paymentIntentId) {
      return NextResponse.json({ error: "Missing requestId or paymentIntentId" }, { status: 400 });
    }

    // Retrieve payment details from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    // Update the catering request deposit status
    const request = await prisma.cateringrequest.update({
      where: { id: Number(requestId) },
      data: { 
        status: "deposit_paid", 
        depositAmount: paymentIntent.amount_received / 100, // Convert from cents to currency
        updatedAt: new Date()
      },
    });

    return NextResponse.json({ success: true, request });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
  }
};
