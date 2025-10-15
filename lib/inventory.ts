import { Prisma, measurement_unit } from "@prisma/client"

export class InventoryError extends Error {
  constructor(
    public code:
      | "INSUFFICIENT_STOCK"
      | "UNIT_MISMATCH"
      | "MISSING_RECIPE"
      | "MISSING_INGREDIENT",
    message: string
  ) {
    super(message)
    this.name = "InventoryError"
  }
}

const unitMetadata: Record<measurement_unit, { group: "WEIGHT" | "VOLUME" | "COUNT"; toBase: number }> = {
  KG: { group: "WEIGHT", toBase: 1000 },
  G: { group: "WEIGHT", toBase: 1 },
  L: { group: "VOLUME", toBase: 1000 },
  ML: { group: "VOLUME", toBase: 1 },
  PIECE: { group: "COUNT", toBase: 1 },
}

const toBaseQuantity = (quantity: number, unit: measurement_unit) => {
  const meta = unitMetadata[unit]
  return quantity * meta.toBase
}

const fromBaseQuantity = (quantity: number, unit: measurement_unit) => {
  const meta = unitMetadata[unit]
  return quantity / meta.toBase
}

const ensureMatchingUnits = (
  ingredientName: string,
  recipeUnit: measurement_unit,
  inventoryUnit: measurement_unit
) => {
  if (unitMetadata[recipeUnit].group !== unitMetadata[inventoryUnit].group) {
    throw new InventoryError(
      "UNIT_MISMATCH",
      `Ingredient ${ingredientName} uses ${inventoryUnit} in inventory but recipe expects ${recipeUnit}.`
    )
  }
}

const formatQuantity = (quantity: number, unit: measurement_unit) => {
  return `${Number(quantity.toFixed(3))} ${unit.toLowerCase()}`
}

export type OrderWithRecipeIngredients = Prisma.orderGetPayload<{
  include: {
    items: {
      include: {
        foodItem: {
          include: {
            recipe: {
              include: {
                ingredients: {
                  include: {
                    ingredient: true
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}>

type TransactionClient = Prisma.TransactionClient

export async function deductInventoryForOrder(
  order: OrderWithRecipeIngredients,
  tx: TransactionClient
) {
  const requirements = new Map<
    number,
    {
      requiredBase: number
      ingredient: OrderWithRecipeIngredients["items"][number]["foodItem"]["recipe"]["ingredients"][number]["ingredient"]
    }
  >()

  for (const item of order.items) {
    const recipe = item.foodItem.recipe
    if (!recipe) {
      throw new InventoryError(
        "MISSING_RECIPE",
        `Food item ${item.foodItem.name} is missing an associated recipe.`
      )
    }

    if (!recipe.ingredients.length) {
      throw new InventoryError(
        "MISSING_RECIPE",
        `Recipe ${recipe.name} has no ingredient breakdown.`
      )
    }

    for (const recipeIngredient of recipe.ingredients) {
      const ingredient = recipeIngredient.ingredient
      if (!ingredient) {
        throw new InventoryError(
          "MISSING_INGREDIENT",
          `Recipe ingredient ${recipeIngredient.id} does not reference a valid ingredient.`
        )
      }

      ensureMatchingUnits(ingredient.name, recipeIngredient.unit, ingredient.unit)

      const requiredBase = toBaseQuantity(
        recipeIngredient.quantity * item.quantity,
        recipeIngredient.unit
      )

      const existing = requirements.get(ingredient.id)
      if (existing) {
        existing.requiredBase += requiredBase
      } else {
        requirements.set(ingredient.id, {
          requiredBase,
          ingredient,
        })
      }
    }
  }

  if (requirements.size === 0) {
    return
  }

  for (const { requiredBase, ingredient } of requirements.values()) {
    const decrementAmount = fromBaseQuantity(requiredBase, ingredient.unit)

    const result = await tx.ingredient.updateMany({
      where: {
        id: ingredient.id,
        stock: { gte: decrementAmount },
      },
      data: {
        stock: {
          decrement: decrementAmount,
        },
      },
    })

    if (result.count === 0) {
      throw new InventoryError(
        "INSUFFICIENT_STOCK",
        `Not enough ${ingredient.name} in stock. Need ${formatQuantity(
          decrementAmount,
          ingredient.unit
        )}.`
      )
    }
  }
}
