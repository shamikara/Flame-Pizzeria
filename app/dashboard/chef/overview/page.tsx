import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import db from "@/lib/db"
import { order_status } from "@prisma/client"

async function getKitchenStats() {
  const [pending, confirmed, preparing, ready] = await Promise.all([
    db.order.count({ where: { status: order_status.PENDING } }),
    db.order.count({ where: { status: order_status.CONFIRMED } }),
    db.order.count({ where: { status: order_status.PREPARING } }),
    db.order.count({ where: { status: order_status.READY_FOR_PICKUP } }),
  ])

  return {
    pending,
    confirmed,
    preparing,
    ready,
  }
}

async function getActiveIngredientLoad() {
  const activeOrders = await db.order.findMany({
    where: {
      status: {
        in: [order_status.PENDING, order_status.CONFIRMED, order_status.PREPARING],
      },
    },
    select: {
      id: true,
      items: {
        select: {
          quantity: true,
          foodItem: {
            select: {
              name: true,
              recipe: {
                select: {
                  ingredients: {
                    select: {
                      quantity: true,
                      unit: true,
                      ingredient: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  const requirements = new Map<
    number,
    { name: string; requiredQuantity: number; unit: string }
  >()

  for (const order of activeOrders) {
    for (const item of order.items) {
      const recipeIngredients = item.foodItem.recipe?.ingredients ?? []
      for (const recipeIngredient of recipeIngredients) {
        const ingredientId = recipeIngredient.ingredient.id
        const existing = requirements.get(ingredientId)
        const required = recipeIngredient.quantity * item.quantity

        if (existing) {
          existing.requiredQuantity += required
        } else {
          requirements.set(ingredientId, {
            name: recipeIngredient.ingredient.name,
            requiredQuantity: required,
            unit: recipeIngredient.unit,
          })
        }
      }
    }
  }

  return Array.from(requirements.values())
    .sort((a, b) => b.requiredQuantity - a.requiredQuantity)
    .slice(0, 5)
}

async function getTickets() {
  const tickets = await db.order.findMany({
    where: {
      status: { in: [order_status.PENDING, order_status.CONFIRMED, order_status.PREPARING] },
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      items: {
        select: {
          quantity: true,
          foodItem: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
    take: 8,
  })

  return tickets
}

export default async function ChefOverviewPage() {
  const [stats, ingredientLoad, tickets] = await Promise.all([
    getKitchenStats(),
    getActiveIngredientLoad(),
    getTickets(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Kitchen Overview</h1>
        <p className="text-sm text-gray-400">
          Snapshot of active orders and prep requirements.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm text-gray-300">Pending tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm text-gray-300">Confirmed orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.confirmed}</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm text-gray-300">Being prepared</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.preparing}</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm text-gray-300">Ready for pickup</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.ready}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="bg-black/20 border-white/10 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-gray-200">Active tickets</CardTitle>
            <CardDescription className="text-gray-400">
              Earliest orders waiting on the line.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.length === 0 && (
                <p className="text-sm text-gray-400">No tickets in the queue right now.</p>
              )}
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-lg border border-white/10 bg-black/30 p-3"
                >
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>Order #{ticket.id}</span>
                    <span className="uppercase text-xs text-orange-300">{ticket.status}</span>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-gray-400">
                    {ticket.items.map((item, index) => (
                      <li key={index}>
                        {item.quantity}× {item.foodItem.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-black/20 border-white/10 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-gray-200">Ingredient load</CardTitle>
            <CardDescription className="text-gray-400">
              Top ingredients needed for active tickets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ingredientLoad.length === 0 && (
                <p className="text-sm text-gray-400">No ingredient load detected.</p>
              )}
              {ingredientLoad.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{entry.name}</span>
                  <span className="text-white font-medium">
                    {entry.requiredQuantity.toFixed(2)} {entry.unit.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
