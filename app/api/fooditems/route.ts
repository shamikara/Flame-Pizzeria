import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { z } from 'zod'
import { promises as fs } from 'fs'
import path from 'path'
import { measurement_unit, Prisma } from '@prisma/client'
import { getServerSession } from '@/lib/session'

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
  recipeIngredients: z.string().optional(),
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

const recipeIngredientsSchema = z.array(
  z.object({
    ingredientId: z.number().int().positive(),
    quantity: z.number().positive(),
    unit: z.nativeEnum(measurement_unit),
  })
)

const ensureRecipeIngredients = async (raw: unknown) => {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error('Recipe ingredients are required')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    throw new Error('Invalid recipe ingredients payload')
  }

  const ingredients = recipeIngredientsSchema.parse(parsed)
  if (!ingredients.length) {
    throw new Error('Please add at least one ingredient to the recipe')
  }

  const uniqueIds = new Set(ingredients.map((entry) => entry.ingredientId))
  if (uniqueIds.size !== ingredients.length) {
    throw new Error('Duplicate ingredients detected in recipe definition')
  }

  const dbIngredients = await prisma.ingredient.findMany({
    where: { id: { in: Array.from(uniqueIds) } },
    select: { id: true, unit: true, name: true },
  })

  if (dbIngredients.length !== uniqueIds.size) {
    throw new Error('One or more selected ingredients no longer exist')
  }

  const ingredientMap = new Map(dbIngredients.map((item) => [item.id, item]))
  for (const entry of ingredients) {
    const ingredient = ingredientMap.get(entry.ingredientId)
    if (!ingredient) continue
    if (ingredient.unit !== entry.unit) {
      throw new Error(`Ingredient ${ingredient.name} uses unit ${ingredient.unit}. Please align the recipe unit.`)
    }
  }

  return ingredients
}

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
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      recipeIngredients: formData.get('recipeIngredients'),
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

    const recipeIngredients = await ensureRecipeIngredients(parsed.data.recipeIngredients)

    const newFoodItem = await prisma.$transaction(async (tx) => {
      const createdFoodItem = await tx.fooditem.create({
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

      await tx.recipe.create({
        data: {
          name: `${parsed.data.name} Recipe`,
          description:
            parsed.data.description?.trim() || `Recipe definition for ${parsed.data.name}`,
          steps: 'Auto-generated recipe steps',
          isActive: true,
          foodItemId: createdFoodItem.id,
          authorId: session.userId,
          ingredients: {
            create: recipeIngredients.map((entry) => ({
              ingredientId: entry.ingredientId,
              quantity: entry.quantity,
              unit: entry.unit,
            })),
          },
        },
      })

      return createdFoodItem
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
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const foodItemId = Number(id)
    if (!Number.isInteger(foodItemId) || foodItemId <= 0) {
      return NextResponse.json({ error: 'Food item ID must be a positive integer' }, { status: 400 })
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
      recipeIngredients: formData.get('recipeIngredients'),
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

    const recipeIngredients = await ensureRecipeIngredients(parsed.data.recipeIngredients)

    let imageUrl = existing.imageUrl
    if (imageFile) {
      imageUrl = await saveImageFile(parsed.data.name, imageFile)
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedFoodItem = await tx.fooditem.update({
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

      const existingRecipe = await tx.recipe.findUnique({
        where: { foodItemId: updatedFoodItem.id },
      })

      const recipe = existingRecipe
        ? await tx.recipe.update({
            where: { id: existingRecipe.id },
            data: {
              name: `${parsed.data.name} Recipe`,
              description:
                parsed.data.description?.trim() || existingRecipe.description || `Recipe for ${parsed.data.name}`,
              steps: existingRecipe.steps || 'Auto-generated recipe steps',
              isActive: true,
            },
          })
        : await tx.recipe.create({
            data: {
              name: `${parsed.data.name} Recipe`,
              description:
                parsed.data.description?.trim() || `Recipe definition for ${parsed.data.name}`,
              steps: 'Auto-generated recipe steps',
              isActive: true,
              foodItemId: updatedFoodItem.id,
              authorId: session.userId,
            },
          })

      await tx.recipeingredient.deleteMany({ where: { recipeId: recipe.id } })
      await tx.recipeingredient.createMany({
        data: recipeIngredients.map((entry) => ({
          recipeId: recipe.id,
          ingredientId: entry.ingredientId,
          quantity: entry.quantity,
          unit: entry.unit,
        })),
      })

      return updatedFoodItem
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
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Food item ID is required' }, { status: 400 })
    }

    const foodItemId = Number(id)
    if (!Number.isInteger(foodItemId) || foodItemId <= 0) {
      return NextResponse.json({ error: 'Food item ID must be a positive integer' }, { status: 400 })
    }

    const [foodItem, orderItemCount] = await Promise.all([
      prisma.fooditem.findUnique({
        where: { id: foodItemId },
        select: { id: true },
      }),
      prisma.orderitem.count({ where: { foodItemId } }),
    ])

    if (!foodItem) {
      return NextResponse.json({ error: 'Food item not found' }, { status: 404 })
    }

    if (orderItemCount > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete food item with existing order history. Consider marking it inactive instead.',
          code: 'FOODITEM_HAS_ORDERS',
        },
        { status: 409 }
      )
    }

    await prisma.$transaction(async (tx) => {
      await tx.recipeingredient.deleteMany({
        where: {
          recipe: {
            foodItemId,
          },
        },
      })

      await tx.recipe.deleteMany({ where: { foodItemId } })

      await tx.customizationingredient.deleteMany({
        where: {
          customization: {
            foodItemId,
          },
        },
      })

      await tx.customization.deleteMany({ where: { foodItemId } })
      await tx.rating.deleteMany({ where: { foodItemId } })

      await tx.fooditem.delete({ where: { id: foodItemId } })
    })

    return NextResponse.json({ message: 'Food item deleted successfully' })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete food item due to related records. Mark it inactive or remove dependencies first.' },
        { status: 409 }
      )
    }

    console.error('Failed to delete food item:', error)
    return NextResponse.json({ error: 'Failed to delete food item' }, { status: 500 })
  }
}