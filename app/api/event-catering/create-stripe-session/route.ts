import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const POST = async (req: Request) => {
  try {
    const { orderId, amount } = await req.json();

    if (!orderId || !amount) return NextResponse.json({ error: "Missing orderId or amount" }, { status: 400 });

    const order = await prisma.cateringrequest.findUnique({ where: { id: Number(orderId) } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "lkr",
            product_data: { name: `Deposit for Catering Request #${orderId}` },
            unit_amount: Math.round(amount), // in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/event-catering/checkout/${orderId}/success?payment_intent={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/event-catering/checkout/${orderId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create Stripe session" }, { status: 500 });
  }
};
