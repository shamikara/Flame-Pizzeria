import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;

        // Find the payment record using payment intent ID
        const payment = await prisma.payment.findFirst({
          where: {
            transactionId: paymentIntent.id,
            status: 'PENDING' // Only update pending payments
          },
        });

        if (payment) {
          // Update payment status
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: "COMPLETED",
            },
          });

          // Update catering request status using orderId as fallback
          const requestId = payment.cateringRequestId || payment.orderId;
          if (requestId) {
            await prisma.cateringrequest.update({
              where: { id: requestId },
              data: {
                status: "CONFIRMED",
              },
            });
          }

          console.log(`Payment ${paymentIntent.id} completed for request ${requestId}`);
        }
        break;

      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object;

        // Find and update failed payment using payment intent ID
        const failedPayment = await prisma.payment.findFirst({
          where: {
            transactionId: failedPaymentIntent.id,
            status: 'PENDING' // Only update pending payments
          },
        });

        if (failedPayment) {
          await prisma.payment.update({
            where: { id: failedPayment.id },
            data: {
              status: "FAILED",
            },
          });

          console.log(`Payment ${failedPaymentIntent.id} failed for request ${failedPayment.orderId}`);
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
