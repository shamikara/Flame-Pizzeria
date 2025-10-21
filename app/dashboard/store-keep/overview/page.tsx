import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import db from "@/lib/db"
import { alert_severity, order_status } from "@prisma/client"

async function getInventoryStats() {
  const [ingredients, expiring, criticalAlerts, restockNeeded] = await Promise.all([
    db.ingredient.findMany({
      select: { stock: true, restockThreshold: true },
    }),
    db.ingredient.count({
      where: {
        expiryDate: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          gt: new Date(),
        },
      },
    }),
    db.inventoryalert.count({ where: { severity: alert_severity.CRITICAL, resolved: false } }),
    db.inventoryalert.count({ where: { severity: alert_severity.OUT, resolved: false } }),
  ])

  const lowStock = ingredients.filter((ing) => ing.stock <= ing.restockThreshold).length

  return {
    lowStock,
    expiring,
    criticalAlerts,
    restockNeeded,
  }
}

async function getLowStockItems() {
  const ingredients = await db.ingredient.findMany({
    select: {
      id: true,
      name: true,
      stock: true,
      restockThreshold: true,
      unit: true,
    },
  })

  return ingredients
    .filter((ingredient) => ingredient.stock <= ingredient.restockThreshold)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8)
}

async function getAlerts() {
  return db.inventoryalert.findMany({
    where: { resolved: false },
    select: {
      id: true,
      message: true,
      severity: true,
      createdAt: true,
      ingredient: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  })
}

async function getUpcomingOrdersImpact() {
  const orders = await db.order.findMany({
    where: {
      status: { in: [order_status.PENDING, order_status.CONFIRMED] },
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
                          stock: true,
                          unit: true,
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

  const impact = new Map<
    number,
    { name: string; required: number; unit: string; stock: number }
  >()

  for (const order of orders) {
    for (const item of order.items) {
      const recipeIngredients = item.foodItem.recipe?.ingredients ?? []
      for (const recipeIngredient of recipeIngredients) {
        const id = recipeIngredient.ingredient.id
        const required = recipeIngredient.quantity * item.quantity
        const existing = impact.get(id)

        if (existing) {
          existing.required += required
        } else {
          impact.set(id, {
            name: recipeIngredient.ingredient.name,
            required,
            unit: recipeIngredient.unit,
            stock: recipeIngredient.ingredient.stock,
          })
        }
      }
    }
  }

  return Array.from(impact.values())
    .sort((a, b) => b.required - a.required)
    .slice(0, 5)
}

export default async function StoreKeepOverviewPage() {
  const [stats, lowStock, alerts, upcomingImpact] = await Promise.all([
    getInventoryStats(),
    getLowStockItems(),
    getAlerts(),
    getUpcomingOrdersImpact(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Inventory Overview</h1>
        <p className="text-sm text-gray-400">
          Quick glance at low-stock items and active alerts.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm text-gray-300">Low stock items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.lowStock}</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm text-gray-300">Expiring soon</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Within the next 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.expiring}</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm text-gray-300">Critical alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.criticalAlerts}</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm text-gray-300">Out of stock alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.restockNeeded}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="bg-black/20 border-white/10 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-gray-200">Low stock watchlist</CardTitle>
            <CardDescription className="text-gray-400">
              Prioritize restocking these ingredients.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStock.length === 0 && (
                <p className="text-sm text-gray-400">Stock levels look healthy right now.</p>
              )}
              {lowStock.map((ingredient) => (
                <div key={ingredient.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 p-3 text-sm">
                  <div>
                    <p className="text-gray-200">{ingredient.name}</p>
                    <p className="text-xs text-gray-500">
                      Threshold {ingredient.restockThreshold} {ingredient.unit.toLowerCase()}
                    </p>
                  </div>
                  <span className="text-white font-semibold">
                    {ingredient.stock.toFixed(2)} {ingredient.unit.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-gray-200">Active inventory alerts</CardTitle>
            <CardDescription className="text-gray-400">
              Latest unresolved alerts from the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.length === 0 && (
                <p className="text-sm text-gray-400">No unresolved alerts at the moment.</p>
              )}
              {alerts.map((alert) => (
                <div key={alert.id} className="rounded-lg border border-white/10 bg-black/30 p-3 text-sm">
                  <p className="text-gray-200">{alert.message}</p>
                  <p className="text-xs text-gray-500">
                    {alert.ingredient?.name ?? "Unknown ingredient"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {alert.severity} • {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="text-gray-200">Upcoming order impact</CardTitle>
          <CardDescription className="text-gray-400">
            Ingredients that will be consumed by open orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {upcomingImpact.length === 0 && (
              <p className="text-sm text-gray-400">No upcoming consumption pressure detected.</p>
            )}
            {upcomingImpact.map((entry) => (
              <div key={entry.name} className="rounded-lg border border-white/10 bg-black/30 p-3 text-sm">
                <p className="text-gray-200">{entry.name}</p>
                <p className="text-xs text-gray-500">
                  Required {entry.required.toFixed(2)} {entry.unit.toLowerCase()} • Stock {entry.stock.toFixed(2)} {entry.unit.toLowerCase()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
