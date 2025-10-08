import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { orderId, paymentIntentId, amount } = await request.json();

    if (!orderId || !paymentIntentId) {
      return NextResponse.json(
        { error: 'orderId and paymentIntentId are required' },
        { status: 400 }
      );
    }

    // Update order status and create payment record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' },
      });

      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: amount ?? order.total,
          method: 'ONLINE',
          status: 'COMPLETED',
          transactionId: String(paymentIntentId),
        },
      });

      return { order, payment };
    });

    // 🧹 Auto-delete old pending orders (>30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    await prisma.order.deleteMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: thirtyMinutesAgo },
      },
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error('orders/mark-paid POST error:', err);
    return NextResponse.json(
      { error: 'Failed to mark order as paid' },
      { status: 500 }
    );
  }
}
