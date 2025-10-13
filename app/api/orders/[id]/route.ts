import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    // Fetch order with items + foodItem + customizations
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        items: {
          select: {
            id: true,
            quantity: true,
            foodItem: { select: { name: true, price: true } },
            customizations: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Prepare payload
    const payload = {
      id: order.id,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      address: order.address,
      phone: order.phone,
      user: {
        firstName: order.user.firstName,
        lastName: order.user.lastName,
      },
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        foodItem: item.foodItem,
        customizations: item.customizations || [],
      })),
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error('orders/[id] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}
