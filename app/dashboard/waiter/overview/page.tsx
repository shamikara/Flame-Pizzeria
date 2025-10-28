import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import db from "@/lib/db"
import { order_status } from "@prisma/client"

async function getServiceStats() {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const [ready, outForDelivery, deliveredToday, activeOrders] = await Promise.all([
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
    activeOrders,
  }
}

async function getPickupQueue() {
  const orders = await db.order.findMany({
    where: { status: order_status.READY_FOR_PICKUP },
    select: {
      id: true,
      createdAt: true,
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

  return orders.map(order => ({
    ...order,
    notes: '' // Add empty notes field for backward compatibility
  }))
}

async function getDeliveryQueue() {
  const orders = await db.order.findMany({
    where: {
      status: {
        in: [order_status.PREPARING, order_status.READY_FOR_PICKUP, order_status.OUT_FOR_DELIVERY],
      },
      deliveryAddress: { not: null },
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      deliveryAddress: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: 6,
  })
  return orders.map(order => ({
    ...order,
    address: order.deliveryAddress, // Map deliveryAddress to address for backward compatibility
    phone: '' // Add empty phone number since the field is required by the UI
  }))
}

async function getTableSummary() {
  const dineInOrders = await db.order.findMany({
    where: {
      status: {
        in: [order_status.PENDING, order_status.CONFIRMED, order_status.PREPARING],
      },
      // Filter for dine-in orders by checking for null deliveryAddress
      deliveryAddress: null,
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      // Since we don't have tableNumber, we'll use order ID as a reference
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: 6,
  });
  
  // Map the results to include a placeholder for table number
  return dineInOrders.map(order => ({
    ...order,
    tableNumber: `Order #${order.id}` // Using order ID as a reference
  }));
}

export default async function WaiterOverviewPage() {
  const [stats, pickupQueue, deliveryQueue, tableSummary] = await Promise.all([
    getServiceStats(),
    getPickupQueue(),
    getDeliveryQueue(),
    getTableSummary(),
  ])

  return (
    <div className="flex-1 space-y-6 p-6 md:p-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
          Service Overview
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Quick view of orders waiting for attention and active tables.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-800 bg-gradient-to-br from-sky-500/10 to-sky-600/5 hover:shadow-lg hover:shadow-sky-500/20 transition-all">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Ready pickups</CardTitle>
            <CardDescription className="text-xs text-gray-400">
              Orders waiting to be handed over
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.ready}</div>
            <p className="text-xs text-gray-400 mt-1">Queue at the counter</p>
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Out for delivery</CardTitle>
            <CardDescription className="text-xs text-gray-400">
              Couriers currently on the road
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.outForDelivery}</div>
            <p className="text-xs text-gray-400 mt-1">Track delivery flow</p>
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Delivered today</CardTitle>
            <CardDescription className="text-xs text-gray-400">
              Successful drop-offs today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.deliveredToday}</div>
            <p className="text-xs text-gray-400 mt-1">Daily performance</p>
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gradient-to-br from-violet-500/10 to-violet-600/5 hover:shadow-lg hover:shadow-violet-500/20 transition-all">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active tables</CardTitle>
            <CardDescription className="text-xs text-gray-400">
              Dine-in tickets still open
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeOrders}</div>
            <p className="text-xs text-gray-400 mt-1">Active orders needing attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900">
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

        <Card className="border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900">
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

      <Card className="border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900">
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
