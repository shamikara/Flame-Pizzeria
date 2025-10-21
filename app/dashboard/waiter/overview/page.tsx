import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import db from "@/lib/db"
import { order_status, order_type } from "@prisma/client"

async function getServiceStats() {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const [ready, outForDelivery, deliveredToday, dineInActive] = await Promise.all([
    db.order.count({ where: { status: order_status.READY_FOR_PICKUP } }),
    db.order.count({ where: { status: order_status.OUT_FOR_DELIVERY } }),
    db.order.count({
      where: {
        status: order_status.DELIVERED,
        updatedAt: { gte: startOfDay },
      },
    }),
    db.order.count({
      where: {
        type: order_type.DINE_IN,
        status: {
          in: [order_status.PENDING, order_status.CONFIRMED, order_status.PREPARING],
        },
      },
    }),
  ])

  return {
    ready,
    outForDelivery,
    deliveredToday,
    dineInActive,
  }
}

async function getPickupQueue() {
  const orders = await db.order.findMany({
    where: { status: order_status.READY_FOR_PICKUP },
    select: {
      id: true,
      createdAt: true,
      notes: true,
      items: {
        select: {
          quantity: true,
          foodItem: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
    take: 6,
  })

  return orders
}

async function getDeliveryQueue() {
  const orders = await db.order.findMany({
    where: {
      type: order_type.DELIVERY,
      status: {
        in: [order_status.PREPARING, order_status.READY_FOR_PICKUP, order_status.OUT_FOR_DELIVERY],
      },
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      address: true,
      phone: true,
    },
    orderBy: { createdAt: "asc" },
    take: 6,
  })

  return orders
}

async function getTableSummary() {
  const dineInOrders = await db.order.findMany({
    where: {
      type: order_type.DINE_IN,
      status: {
        in: [order_status.PENDING, order_status.CONFIRMED, order_status.PREPARING],
      },
    },
    select: {
      id: true,
      tableNumber: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
    take: 6,
  })

  return dineInOrders
}

export default async function WaiterOverviewPage() {
  const [stats, pickupQueue, deliveryQueue, tableSummary] = await Promise.all([
    getServiceStats(),
    getPickupQueue(),
    getDeliveryQueue(),
    getTableSummary(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Service Overview</h1>
        <p className="text-sm text-gray-400">
          Quick view of orders waiting for attention and active tables.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm text-gray-300">Ready pickups</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Orders waiting to be handed over
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.ready}</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm text-gray-300">Out for delivery</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Couriers currently on the road
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.outForDelivery}</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm text-gray-300">Delivered today</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Successful drop-offs today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.deliveredToday}</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm text-gray-300">Active tables</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Dine-in tickets still open
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.dineInActive}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-gray-200">Pickup queue</CardTitle>
            <CardDescription className="text-gray-400">
              Orders ready for guest collection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pickupQueue.length === 0 && (
                <p className="text-sm text-gray-400">No pickups waiting.</p>
              )}
              {pickupQueue.map((order) => (
                <div key={order.id} className="rounded-lg border border-white/10 bg-black/30 p-3">
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>Order #{order.id}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-gray-400">
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.quantity}× {item.foodItem.name}
                      </li>
                    ))}
                  </ul>
                  {order.notes && (
                    <p className="mt-2 text-xs text-orange-300">Note: {order.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-gray-200">Delivery queue</CardTitle>
            <CardDescription className="text-gray-400">
              Deliveries in flight or awaiting pickup.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deliveryQueue.length === 0 && (
                <p className="text-sm text-gray-400">No active deliveries right now.</p>
              )}
              {deliveryQueue.map((order) => (
                <div key={order.id} className="rounded-lg border border-white/10 bg-black/30 p-3">
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>Order #{order.id}</span>
                    <span className="uppercase text-xs text-orange-200">{order.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{order.address}</p>
                  <p className="text-xs text-gray-500">{order.phone}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="text-gray-200">Active tables</CardTitle>
          <CardDescription className="text-gray-400">
            Dine-in orders awaiting service.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {tableSummary.length === 0 && (
              <p className="text-sm text-gray-400">No active tables pending service.</p>
            )}
            {tableSummary.map((order) => (
              <div key={order.id} className="rounded-lg border border-white/10 bg-black/30 p-3">
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <span>Table {order.tableNumber ?? "?"}</span>
                  <span className="uppercase text-xs text-orange-200">{order.status}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Opened at {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
