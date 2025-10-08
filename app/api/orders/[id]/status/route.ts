import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

const ALLOWED_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
] as const

type AllowedStatus = typeof ALLOWED_STATUSES[number]

export async function PATCH(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params
    const { status } = await request.json()

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: status as AllowedStatus },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('orders/[id]/status PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}
