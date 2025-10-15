import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { z } from 'zod'

const fooditemSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  price: z.number().positive(),
  imageUrl: z.string().nullable(),
  categoryId: z.number(),
  isActive: z.boolean(),
  foodType: z.number().int().min(0).max(31), // allow multi-flag bitmask
  nutrition: z.record(z.number()).nullable().optional(),
})

export async function GET() {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const orderItems = await prisma.orderitem.findMany({
      where: {
        order: {
          createdAt: { gte: thirtyDaysAgo },
          status: { notIn: ['CANCELLED', 'REFUNDED'] },
        },
      },
      include: {
        foodItem: {
          include: { category: true },
        },
      },
    })

    const itemCounts: Record<number, { count: number; item: any }> = {}

    for (const orderItem of orderItems) {
      const foodItemId = orderItem.foodItemId
      if (!itemCounts[foodItemId]) {
        itemCounts[foodItemId] = {
          count: 0,
          item: orderItem.foodItem,
        }
      }
      itemCounts[foodItemId].count += orderItem.quantity
    }

    const popularItems = Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map(({ item }) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        image: item.imageUrl || '/placeholder.svg',
        category: item.category?.name || 'unknown',
        foodType: item.foodType ?? 0,
        nutrition: item.nutrition ?? null,
      }))

    if (popularItems.length < 4) {
      const additionalItems = await prisma.fooditem.findMany({
        where: {
          isActive: true,
          id: { notIn: popularItems.map((item) => item.id) },
        },
        include: { category: true },
        take: 4 - popularItems.length,
        orderBy: { createdAt: 'desc' },
      })

      const formattedAdditional = additionalItems.map((item: { id: any; name: any; description: any; price: any; imageUrl: any; category: { name: any }; foodType: any; nutrition: any }) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        image: item.imageUrl || '/placeholder.svg',
        category: item.category?.name || 'unknown',
        foodType: item.foodType ?? 0,
        nutrition: item.nutrition ?? null,
      }))

      popularItems.push(...formattedAdditional)
    }

    return NextResponse.json(popularItems)
  } catch (err) {
    console.error('fooditems/popular GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch popular items' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = foodItemSchema.parse(await request.json())

    const newFoodItem = await prisma.fooditem.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
        isActive: data.isActive,
        foodType: data.foodType,
        nutrition: data.nutrition ?? null,
      },
      include: { category: true },
    })

    return NextResponse.json(newFoodItem, { status: 201 })
  } catch (error) {
    console.error('Failed to create food item:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Food item ID is required' }, { status: 400 })
    }

    const data = foodItemSchema.parse(await request.json())

    const updatedFoodItem = await prisma.fooditem.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
        isActive: data.isActive,
        foodType: data.foodType,
        nutrition: data.nutrition ?? null,
      },
      include: { category: true },
    })

    return NextResponse.json(updatedFoodItem)
  } catch (error) {
    console.error('Failed to update food item:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Food item ID is required' }, { status: 400 })
    }

    await prisma.fooditem.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: 'Food item deleted successfully' })
  } catch (error) {
    console.error('Failed to delete food item:', error)
    return NextResponse.json({ error: 'Failed to delete food item' }, { status: 500 })
  }
}