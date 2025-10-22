import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getServerSession, type UserPayload } from '@/lib/session'
import { deductInventoryForOrder, InventoryError } from '@/lib/inventory'
import { sendEmail } from '@/lib/email'
import type { Prisma } from '@prisma/client'

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

const INVENTORY_DEDUCTION_STATUSES = new Set<AllowedStatus>(['CONFIRMED'])

const ORDER_WITH_ITEMS_INCLUDE = {
  user: { select: { firstName: true, lastName: true, email: true } },
  items: {
    include: {
      foodItem: {
        include: {
          recipe: {
            include: {
              ingredients: {
                include: {
                  ingredient: true,
                },
              },
            },
          },
        },
      },
    },
  },
} as const

type OrderWithItems = Prisma.orderGetPayload<{ include: typeof ORDER_WITH_ITEMS_INCLUDE }>

type OrderItemCustomization = { name: string; price: number }

const toCustomizationArray = (value: unknown): OrderItemCustomization[] => {
  if (!Array.isArray(value)) return []

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null

      const name = 'name' in entry && typeof (entry as Record<string, unknown>).name === 'string'
        ? (entry as Record<string, unknown>).name
        : null

      if (!name) return null

      const rawPrice = 'price' in entry ? Number((entry as Record<string, unknown>).price) : 0
      const price = Number.isFinite(rawPrice) ? rawPrice : 0

      return { name, price }
    })
    .filter((entry): entry is OrderItemCustomization => entry !== null)
}

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

    const orderId = parseInt(id, 10)

    const orderBeforeUpdate = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        inventoryDeducted: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    })

    if (!orderBeforeUpdate) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (orderBeforeUpdate.status === 'DELIVERED' && orderBeforeUpdate.status !== status) {
      return NextResponse.json({ error: 'Delivered orders cannot be modified' }, { status: 400 })
    }

    const shouldDeductInventory = INVENTORY_DEDUCTION_STATUSES.has(status as AllowedStatus)

    let orderDetailsForNotifications: OrderWithItems | null = null
    let updated: { id: number; status: AllowedStatus; updatedAt: Date }

    try {
      const txResult = await prisma.$transaction(async (tx) => {
        const orderWithIngredients = await tx.order.findUnique({
          where: { id: orderId },
          include: ORDER_WITH_ITEMS_INCLUDE,
        })

        if (!orderWithIngredients) {
          throw new Error('ORDER_NOT_FOUND')
        }

        if (shouldDeductInventory && !orderWithIngredients.inventoryDeducted) {
          await deductInventoryForOrder(orderWithIngredients, tx)
        }

        const updateData: { status: AllowedStatus; inventoryDeducted: boolean } = {
          status: status as AllowedStatus,
          inventoryDeducted: shouldDeductInventory
            ? true
            : orderWithIngredients.inventoryDeducted,
        }

        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: updateData,
          select: {
            id: true,
            status: true,
            updatedAt: true,
          },
        })

        return { updatedOrder, orderWithIngredients }
      })

      updated = txResult.updatedOrder as typeof updated
      orderDetailsForNotifications = txResult.orderWithIngredients as OrderWithItems
    } catch (transactionError) {
      if (transactionError instanceof InventoryError) {
        return NextResponse.json(
          { error: transactionError.message, code: transactionError.code },
          { status: 400 }
        )
      }

      if ((transactionError as Error).message === 'ORDER_NOT_FOUND') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      throw transactionError
    }

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

    if (status === 'DELIVERED' && orderBeforeUpdate.status !== 'DELIVERED' && orderDetailsForNotifications) {
      const detailedOrder = orderDetailsForNotifications

      const customerEmail = detailedOrder.user?.email

      if (customerEmail) {
        const items = detailedOrder.items.map((item: OrderWithItems['items'][number]) => {
          const customizations = toCustomizationArray(item.customizations)
          const customizationsTotal = customizations.reduce((sum, entry) => sum + entry.price, 0)
          const basePrice = typeof item.price === 'number' ? item.price : item.foodItem?.price ?? 0
          const lineTotal = (basePrice + customizationsTotal) * item.quantity

          return {
            name: item.foodItem?.name ?? `Item #${item.id}`,
            quantity: item.quantity,
            basePrice,
            lineTotal,
            customizations: customizations.map((entry) => entry.name),
          }
        })

        const deliveryAddress = detailedOrder.deliveryAddress ?? detailedOrder.address
        const customerName = [detailedOrder.user?.firstName, detailedOrder.user?.lastName]
          .filter(Boolean)
          .join(' ')
          .trim()
          || customerEmail

        try {
          await sendEmail({
            to: customerEmail,
            subject: `Your Flames Pizzeria order #${updated.id} has been delivered`,
            template: 'order-receipt',
            data: {
              orderId: updated.id,
              customerName,
              deliveredAt: new Date().toLocaleString(),
              total: detailedOrder.total,
              items,
              deliveryAddress: deliveryAddress ?? undefined,
            },
          })
        } catch (emailError) {
          console.error('Failed to send delivery email:', emailError)
        }
      }
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error('orders/[id]/status PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}