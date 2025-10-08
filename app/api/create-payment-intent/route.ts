import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-07-30.basil" });

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  customizations: { id: number; name: string; price: number }[];
}

export async function POST(request: Request) {
  try {
    const { cart }: { cart: CartItem[] } = await request.json();
    if (!cart || cart.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    const subtotal = cart.reduce((total, item) => {
      const customizationsPrice = item.customizations.reduce((sum, c) => sum + c.price, 0);
      return total + (item.price + customizationsPrice) * item.quantity;
    }, 0);

    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    const amount = Math.round(total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "lkr",
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("[PAYMENT_INTENT_ERROR]", err);
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}
