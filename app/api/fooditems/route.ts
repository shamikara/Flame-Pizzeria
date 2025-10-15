import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { z } from 'zod'
import { promises as fs } from 'fs'
import path from 'path'

const MAX_IMAGE_SIZE = 500 * 1024 // 500KB
const IMAGE_DIR = path.join(process.cwd(), 'public', 'img', 'fooditems')

const sanitizeFileName = (name: string) => {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return base || 'food'
}

const ensureImageConstraints = (file: File | null, requireImage: boolean) => {
  if (!file) {
    if (requireImage) {
      throw new Error('Image file is required and must be a PNG under 500KB')
    }
    return
  }

  if (file.type !== 'image/png') {
    throw new Error('Only PNG images are allowed')
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image must be 500KB or smaller')
  }
}

const saveImageFile = async (foodName: string, file: File | null) => {
  if (!file) return null

  await fs.mkdir(IMAGE_DIR, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  const fileName = `${sanitizeFileName(foodName)}.png`
  const filePath = path.join(IMAGE_DIR, fileName)

  await fs.writeFile(filePath, buffer)
  return `img/fooditems/${fileName}`
}

const formDataSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.string().min(1),
  categoryId: z.string().min(1),
  isActive: z.string().min(1),
  foodType: z.string().min(1),
  nutrition: z.string().nullable().optional(),
})

const parseNutrition = (raw: string | null | undefined) => {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Nutrition must be an object')
    }

    const numericEntries = Object.entries(parsed).reduce<Record<string, number>>((acc, [key, value]) => {
      const num = Number(value)
      if (!Number.isFinite(num)) {
        throw new Error(`Nutrition value for ${key} must be a number`)
      }
      acc[key] = num
      return acc
    }, {})

    return Object.keys(numericEntries).length ? numericEntries : null
  } catch (error) {
    throw new Error('Invalid nutrition data. Please check your values.')
  }
}

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
    const formData = await request.formData()
    const imageFile = formData.get('image') as File | null

    const parsed = formDataSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description') ?? '',
      price: formData.get('price'),
      categoryId: formData.get('categoryId'),
      isActive: formData.get('isActive'),
      foodType: formData.get('foodType'),
      nutrition: formData.get('nutrition'),
    })

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    ensureImageConstraints(imageFile, true)

    const price = Number(parsed.data.price)
    const categoryId = Number(parsed.data.categoryId)
    const foodType = Number(parsed.data.foodType)
    const isActive = parsed.data.isActive === 'true'

    if (!Number.isFinite(price) || price <= 0) {
      throw new Error('Price must be a positive number')
    }
    if (!Number.isInteger(categoryId)) {
      throw new Error('Category is invalid')
    }
    if (!Number.isInteger(foodType)) {
      throw new Error('Food type is invalid')
    }

    const nutrition = parseNutrition(parsed.data.nutrition ?? null)
    const nutritionJson = nutrition ? JSON.parse(JSON.stringify(nutrition)) : null
    const imageUrl = await saveImageFile(parsed.data.name, imageFile)

    const newFoodItem = await prisma.fooditem.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description?.trim() || null,
        price,
        categoryId,
        isActive,
        foodType,
        nutrition: nutritionJson,
        imageUrl,
      },
      include: { category: true },
    })

    return NextResponse.json(newFoodItem, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create food item:', error)
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Food item ID is required' }, { status: 400 })
    }

    const existing = await prisma.fooditem.findUnique({ where: { id: Number(id) } })
    if (!existing) {
      return NextResponse.json({ error: 'Food item not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const imageFile = formData.get('image') as File | null

    const parsed = formDataSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description') ?? '',
      price: formData.get('price'),
      categoryId: formData.get('categoryId'),
      isActive: formData.get('isActive'),
      foodType: formData.get('foodType'),
      nutrition: formData.get('nutrition'),
    })

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    ensureImageConstraints(imageFile, false)

    const price = Number(parsed.data.price)
    const categoryId = Number(parsed.data.categoryId)
    const foodType = Number(parsed.data.foodType)
    const isActive = parsed.data.isActive === 'true'

    if (!Number.isFinite(price) || price <= 0) {
      throw new Error('Price must be a positive number')
    }
    if (!Number.isInteger(categoryId)) {
      throw new Error('Category is invalid')
    }
    if (!Number.isInteger(foodType)) {
      throw new Error('Food type is invalid')
    }

    const nutrition = parseNutrition(parsed.data.nutrition ?? null)
    const nutritionJson = nutrition ? JSON.parse(JSON.stringify(nutrition)) : null

    let imageUrl = existing.imageUrl
    if (imageFile) {
      imageUrl = await saveImageFile(parsed.data.name, imageFile)
    }

    const updated = await prisma.fooditem.update({
      where: { id: Number(id) },
      data: {
        name: parsed.data.name,
        description: parsed.data.description?.trim() || null,
        price,
        categoryId,
        isActive,
        foodType,
        nutrition: nutritionJson,
        imageUrl,
      },
      include: { category: true },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Failed to update food item:', error)
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 400 })
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