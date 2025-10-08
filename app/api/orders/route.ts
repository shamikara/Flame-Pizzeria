import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, total } = body

    if (!userId || !total) {
      return NextResponse.json({ error: 'Missing userId or total' }, { status: 400 })
    }

    // 🧹 Cleanup old pending orders (older than 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)

    await prisma.order.deleteMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: thirtyMinutesAgo },
      },
    })

    // 🧾 Create new order
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: 'PENDING',
        createdAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, order })
  } catch (err: any) {
    console.error('Order creation error:', err)
    return NextResponse.json({ error: 'Internal Server Error', detail: err.message }, { status: 500 })
  }
}
