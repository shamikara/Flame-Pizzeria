import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: "2025-07-30.basil" // Using the latest stable API version
});

// For testing with small amounts, we'll use a different currency in test mode
const isTestMode = process.env.NODE_ENV !== 'production';
const CURRENCY = isTestMode ? 'inr' : 'lkr'; // Use INR in test mode for lower minimums

interface CartItem {
  productId: string;
  price: number;
  quantity: number;
  customizations?: { name: string; price: number }[];
}

export async function POST(request: Request) {
  try {
    const { cart }: { cart: CartItem[] } = await request.json();
    
    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate order total
    const subtotal = cart.reduce((total, item) => {
      const customizationsPrice = item.customizations?.reduce((sum, c) => sum + c.price, 0) ?? 0;
      return total + (item.price + customizationsPrice) * item.quantity;
    }, 0);

    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    
    // Convert to smallest currency unit (cents/pence)
    // For LKR, 1 LKR = 100 cents
    // For test mode (INR), 1 INR = 100 paise
    let amount = Math.round(total * 100);
    
    // Set minimum amount based on currency
    const MIN_AMOUNTS = {
      lkr: 10000,  // 100.00 LKR minimum in production
      inr: 500,    // 5.00 INR minimum in test mode
    };

    if (amount < MIN_AMOUNTS[CURRENCY]) {
      console.log(`[PAYMENT_INTENT] Amount ${amount} is below minimum for ${CURRENCY}, using test mode`);
      if (isTestMode) {
        // In test mode, we can use a different currency with lower minimums
        amount = MIN_AMOUNTS['inr']; // Use INR minimum for testing
      } else {
        // In production, show an error for amounts below minimum
        return NextResponse.json(
          { error: `Order total is too small. Minimum order amount is ${(MIN_AMOUNTS['lkr']/100).toFixed(2)} LKR` }, 
          { status: 400 }
        );
      }
    }

    console.log(`[PAYMENT_INTENT] Creating payment intent for ${amount} ${CURRENCY.toUpperCase()} (${(amount / 100).toFixed(2)} ${CURRENCY.toUpperCase()})`);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: CURRENCY,
      automatic_payment_methods: { enabled: true },
      metadata: {
        original_amount: total.toFixed(2),
        original_currency: 'lkr',
        is_test_mode: isTestMode.toString(),
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("[PAYMENT_INTENT_ERROR]", err);
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}