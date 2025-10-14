import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { order_status } from '@prisma/client'

export async function GET() {
  try {
    // ✅ Cleanup old pending orders
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    try {
      await prisma.order.deleteMany({
        where: {
          status: order_status.PENDING,
          createdAt: { lt: thirtyMinutesAgo },
        },
      });
    } catch (cleanupError) {
      console.error("[ORDERS_LIST_CLEANUP_ERROR]", cleanupError);
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true } },
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            customizations: true,
            foodItem: { select: { name: true, price: true } },
          },
        },
      },
      take: 100,
    })

    const payload = orders.map((o: { id: any; total: any; status: any; createdAt: any; address: any; phone: any; user: { firstName: any; lastName: any; }; items: { id: any; quantity: any; price: any; foodItem: any; customizations: any; }[]; }) => ({
      id: o.id,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt,
      address: o.address,
      phone: o.phone,
      user: {
        firstName: o.user.firstName,
        lastName: o.user.lastName,
      },
      items: o.items.map((item: { id: any; quantity: any; price: any; foodItem: any; customizations: any; }) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        foodItem: item.foodItem,
        customizations: item.customizations || [],
      })),
    }))

    return NextResponse.json(payload)
  } catch (err) {
    console.error('orders/list GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}