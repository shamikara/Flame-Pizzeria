import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getServerSession, type UserPayload } from '@/lib/session'

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
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = session.role

    const rolePermissions: Record<UserPayload['role'], readonly AllowedStatus[]> = {
      ADMIN: ALLOWED_STATUSES,
      MANAGER: ALLOWED_STATUSES,
      CHEF: ['PREPARING', 'READY_FOR_PICKUP'],
      WAITER: ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      STORE_KEEP: [],
      CUSTOMER: [],
      DELIVERY_PERSON: [],
      KITCHEN_HELPER: [],
      STAFF: []
    }

    const { id } = context.params
    const { status } = await request.json()

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    if (!rolePermissions[role]?.includes(status as AllowedStatus)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const orderBeforeUpdate = await prisma.order.findUnique({
      where: { id: parseInt(id, 10) },
      select: {
        id: true,
        status: true,
        user: { select: { firstName: true, lastName: true } },
      },
    })

    if (!orderBeforeUpdate) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (orderBeforeUpdate.status === 'DELIVERED' && orderBeforeUpdate.status !== status) {
      return NextResponse.json({ error: 'Delivered orders cannot be modified' }, { status: 400 })
    }

    const updated = await prisma.order.update({
      where: { id: parseInt(id, 10) },
      data: { status: status as AllowedStatus },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    })

    if (status === 'READY_FOR_PICKUP' && orderBeforeUpdate.status !== 'READY_FOR_PICKUP') {
      try {
        const staffUsers = await prisma.user.findMany({
          where: {
            role: { in: ['ADMIN', 'MANAGER', 'WAITER', 'CHEF'] },
            isActive: true,
          },
          select: { id: true, firstName: true, lastName: true },
        })

        const notifications = staffUsers.map((user) => ({
          message: `Order #${orderBeforeUpdate.id} is ready for pickup! Customer: ${orderBeforeUpdate.user.firstName} ${orderBeforeUpdate.user.lastName}`,
          type: 'ORDER_READY' as const,
          orderId: orderBeforeUpdate.id,
          userId: user.id,
        }))

        if (notifications.length > 0) {
          await prisma.notification.createMany({
            data: notifications,
          })
        }
      } catch (notificationError) {
        console.error('Failed to create notifications:', notificationError)
      }
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error('orders/[id]/status PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}