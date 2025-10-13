import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, total, type, address, phone, notes, tableNumber, deliveryAddress } = body

    if (!userId || !total || !type || !address || !phone) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, total, type, address, and phone are required' 
      }, { status: 400 })
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
        type,
        address,
        phone,
        status: 'PENDING',
        notes: notes || null,
        tableNumber: tableNumber || null,
        deliveryAddress: deliveryAddress || null,
        createdAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, order })
  } catch (err: any) {
    console.error('Order creation error:', err)
    return NextResponse.json({ error: 'Internal Server Error', detail: err.message }, { status: 500 })
  }
}