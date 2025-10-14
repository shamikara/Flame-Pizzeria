import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { order_status } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentIntentId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    // Update order status to CONFIRMED
    const order = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { 
        status: order_status.CONFIRMED,
      },
    });

    // Optionally create a payment record
    if (paymentIntentId) {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: order.total,
          method: "ONLINE",
          status: "COMPLETED",
          transactionId: paymentIntentId,
        },
      });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("[CONFIRM_PAYMENT_ERROR]", error);
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
  }
}