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

    // Get the order before updating to check if it's being marked as ready
    const orderBeforeUpdate = await prisma.order.findUnique({
      where: { id: parseInt(id, 10) },
      select: { id: true, status: true, user: { select: { firstName: true, lastName: true } } }
    })

    const updated = await prisma.order.update({
      where: { id: parseInt(id, 10) },
      data: { status: status as AllowedStatus },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    })

    // If order is being marked as READY_FOR_PICKUP, create notifications
    if (status === 'READY_FOR_PICKUP' && orderBeforeUpdate && orderBeforeUpdate.status !== 'READY_FOR_PICKUP') {
      try {
        // Get all staff users (not customers) to notify
        const staffUsers = await prisma.user.findMany({
          where: {
            role: { in: ['ADMIN', 'MANAGER', 'WAITER', 'CHEF'] },
            isActive: true
          },
          select: { id: true, firstName: true, lastName: true }
        })

        // Create notifications for all staff
        const notifications = staffUsers.map(user => ({
          message: `Order #${orderBeforeUpdate.id} is ready for pickup! Customer: ${orderBeforeUpdate.user.firstName} ${orderBeforeUpdate.user.lastName}`,
          type: 'ORDER_READY' as const,
          orderId: orderBeforeUpdate.id,
          userId: user.id
        }))

        if (notifications.length > 0) {
          await prisma.notification.createMany({
            data: notifications
          })
        }
      } catch (notificationError) {
        // Don't fail the order update if notifications fail
        console.error('Failed to create notifications:', notificationError)
      }
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error('orders/[id]/status PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}