import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const foodItemIdParam = searchParams.get("foodItemId")

    if (!foodItemIdParam) {
      return NextResponse.json({ error: "foodItemId query parameter is required" }, { status: 400 })
    }

    const foodItemId = Number(foodItemIdParam)
    if (!Number.isFinite(foodItemId) || foodItemId <= 0) {
      return NextResponse.json({ error: "foodItemId must be a positive number" }, { status: 400 })
    }

    const recipe = await prisma.recipe.findUnique({
      where: { foodItemId },
      include: {
        ingredients: {
          include: {
            ingredient: {
              select: { id: true, name: true, unit: true },
            },
          },
          orderBy: { id: "asc" },
        },
      },
    })

    if (!recipe) {
      return NextResponse.json({ ingredients: [] })
    }

    const ingredients = recipe.ingredients.map((entry) => ({
      id: entry.id,
      ingredientId: entry.ingredientId,
      ingredientName: entry.ingredient?.name ?? null,
      quantity: entry.quantity,
      unit: entry.unit,
    }))

    return NextResponse.json({ ingredients })
  } catch (error) {
    console.error("Failed to load recipe for food item:", error)
    return NextResponse.json({ error: "Failed to load recipe" }, { status: 500 })
  }
}
