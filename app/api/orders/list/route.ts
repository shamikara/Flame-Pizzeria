import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
      take: 100,
    })

    const payload = orders.map((o: { id: any; total: any; status: any; createdAt: any; address: any; phone: any; user: { firstName: any; lastName: any } }) => ({
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
    }))

    return NextResponse.json(payload)
  } catch (err) {
    console.error('orders/list GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
