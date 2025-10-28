import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import db from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orders = await db.order.findMany({
      where: {
        userId: session.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: {
          include: {
            foodItem: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      orders: orders.map(order => ({
        ...order,
        total: Number(order.total),
        items: order.items.map(item => ({
          ...item,
          price: Number(item.price),
          foodItem: {
            ...item.foodItem,
            price: Number(item.foodItem.price),
          },
        })),
      })),
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
