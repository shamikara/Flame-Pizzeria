import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const items = await prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: startOfDay } } },
      include: { foodItem: { select: { name: true } } },
    })

    const counts: Record<string, number> = {}
    for (const item of items) {
      const name = item.foodItem?.name || 'Unknown'
      counts[name] = (counts[name] || 0) + item.quantity
    }

    const result = Object.entries(counts).map(([name, count]) => ({ name, count }))
    return NextResponse.json(result)
  } catch (err) {
    console.error('orders/today-popular GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch popular items' }, { status: 500 })
  }
}