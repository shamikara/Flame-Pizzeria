import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';
import { OrderStatus, OrderType } from '@prisma/client';

// Schema for validating the incoming request body
const createOrderSchema = z.object({
  userId: z.string(),
  total: z.number(),
  status: z.nativeEnum(OrderStatus),
  type: z.nativeEnum(OrderType),
  tableNumber: z.string().optional(),
  deliveryAddress: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createOrderSchema.parse(body);

    const newOrder = await db.order.create({
      data: {
        userId: data.userId,
        total: data.total,
        status: data.status,
        type: data.type,
        tableNumber: data.tableNumber,
        deliveryAddress: data.deliveryAddress,
      },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Failed to create order:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}