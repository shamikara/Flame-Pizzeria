"use client";

import { useMemo, useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { MoreHorizontal, Eye, Printer, ShoppingBag } from "lucide-react";
import { PopularItemsPieChart } from "@/components/charts/popular-items-pie-chart";
import { Spinner } from "@/components/ui/spinner";
import { useSession, SessionUserRole } from "@/components/session-provider";

type Customization = {
  name: string;
  price: number;
};

type OrderItemWithCustomizations = {
  id: number;
  quantity: number;
  price: number;
  foodItem: { name: string; price: number };
  customizations?: any;
};

type OrderWithDetails = {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  address: string;
  phone: string;
  user: { firstName: string; lastName: string };
  items: OrderItemWithCustomizations[];
};

type PopularItemData = { name: string; count: number };

const statusVariantMap: Record<
  string,
  "secondary" | "outline" | "default" | "destructive"
> = {
  PENDING: "secondary",
  CONFIRMED: "outline",
  PREPARING: "outline",
  READY_FOR_PICKUP: "outline",
  OUT_FOR_DELIVERY: "outline",
  DELIVERED: "default",
  CANCELLED: "destructive",
  REFUNDED: "destructive",
};

const statusColorMap: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  CONFIRMED: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  PREPARING: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  READY_FOR_PICKUP: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
  OUT_FOR_DELIVERY: "bg-indigo-500/20 text-indigo-400 border-indigo-500/50",
  DELIVERED: "bg-green-500/20 text-green-400 border-green-500/50",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/50",
  REFUNDED: "bg-orange-500/20 text-orange-400 border-orange-500/50",
};

const roleStatusMap: Record<SessionUserRole, readonly string[]> = {
  ADMIN: [
    "CONFIRMED",
    "PREPARING",
    "READY_FOR_PICKUP",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ],
  MANAGER: [
    "CONFIRMED",
    "PREPARING",
    "READY_FOR_PICKUP",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ],
  CHEF: ["PREPARING", "READY_FOR_PICKUP"],
  WAITER: ["OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
  STORE_KEEP: [],
  DELIVERY_PERSON: [],
  KITCHEN_HELPER: [],
  STAFF: [],
  CUSTOMER: [],
};

const requiresConfirmation = new Set(["DELIVERED"]);

export default function OrdersPage() {
  const { user } = useSession();
  const allowedStatuses = useMemo<readonly string[]>(() => {
    if (!user) return [];
    return roleStatusMap[user.role] ?? [];
  }, [user]);

  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [pendingAction, setPendingAction] = useState<{ orderId: number; status: string } | null>(null);

  const [popularItems, setPopularItems] = useState<PopularItemData[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);

      const [ordersRes, popularItemsRes] = await Promise.all([
        fetch("/api/orders/list"),
        fetch("/api/orders/today-popular"),
      ]);

      const rawOrders = await ordersRes.json().catch(() => []);
      const normalizedOrders = Array.isArray(rawOrders)
        ? rawOrders
        : Array.isArray(rawOrders?.orders)
          ? rawOrders.orders
          : [];
      setOrders(normalizedOrders);

      const rawPopular = await popularItemsRes.json().catch(() => []);
      setPopularItems(Array.isArray(rawPopular) ? rawPopular : []);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setOrders([]);
      setPopularItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const orderList = Array.isArray(orders) ? orders : [];
  const totalOrders = orderList.length;
  const pendingCount = orderList.filter((o) => o.status === "PENDING").length;
  const deliveredCount = orderList.filter((o) => o.status === "DELIVERED").length;

  const updateStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const triggerStatusChange = (orderId: number, status: string) => {
    if (requiresConfirmation.has(status)) {
      setPendingAction({ orderId, status });
      return;
    }
    updateStatus(orderId, status);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const getCustomizationsArray = (customizations: any): Customization[] => {
    if (!customizations) return [];
    if (Array.isArray(customizations)) return customizations;
    return [];
  };

  const calculateItemSubtotal = (item: OrderItemWithCustomizations) => {
    const customizations = getCustomizationsArray(item.customizations);
    const customizationsTotal = customizations.reduce((sum, c) => sum + c.price, 0);
    return (item.price + customizationsTotal) * item.quantity;
  };

  const handlePrintReceipt = () => {
    if (!selectedOrder) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const customizations = (item: OrderItemWithCustomizations) =>
      getCustomizationsArray(item.customizations);

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - Order #${selectedOrder.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 400px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
            .header h1 { font-size: 24px; margin-bottom: 5px; }
            .info { margin-bottom: 15px; font-size: 12px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .items { margin-bottom: 15px; }
            .item { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #ddd; }
            .item-name { font-weight: bold; margin-bottom: 3px; }
            .item-details { font-size: 11px; color: #666; margin-left: 10px; }
            .totals { border-top: 2px solid #000; padding-top: 10px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .grand-total { font-weight: bold; font-size: 16px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; border-top: 2px dashed #000; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FLAMES PIZZERIA</h1>
            <p>Order Receipt</p>
          </div>
          <div class="info">
            <div class="info-row"><span>Order #:</span><span>${selectedOrder.id}</span></div>
            <div class="info-row"><span>Date:</span><span>${new Date(selectedOrder.createdAt).toLocaleString()}</span></div>
            <div class="info-row"><span>Customer:</span><span>${selectedOrder.user.firstName} ${selectedOrder.user.lastName}</span></div>
            <div class="info-row"><span>Phone:</span><span>${selectedOrder.phone}</span></div>
            <div class="info-row"><span>Address:</span><span>${selectedOrder.address}</span></div>
            <div class="info-row"><span>Status:</span><span>${selectedOrder.status}</span></div>
          </div>
          <div class="items">
            <h3>Items:</h3>
            ${selectedOrder.items.map(item => `
              <div class="item">
                <div class="item-name">${item.quantity}x ${item.foodItem.name}</div>
                <div class="item-details">@ Rs. ${item.price.toFixed(2)} each</div>
                ${customizations(item).length > 0 ? `
                  <div class="item-details">
                    Customizations: ${customizations(item).map(c => `${c.name} (+Rs. ${c.price.toFixed(2)})`).join(', ')}
                  </div>
                ` : ''}
                <div class="item-details">Subtotal: Rs. ${calculateItemSubtotal(item).toFixed(2)}</div>
              </div>
            `).join('')}
          </div>
          <div class="totals">
            <div class="total-row grand-total">
              <span>TOTAL:</span>
              <span>Rs. ${selectedOrder.total.toFixed(2)}</span>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for your order!</p>
            <p>Visit us again soon!</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Orders Management
        </h2>
      </div>

      <div className="grid gap-6 mb-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900 shadow-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-200">Today's Popular Items</h3>
          {popularItems.length > 0 ? (
            <PopularItemsPieChart data={popularItems} />
          ) : (
            <p className="text-center text-gray-400 py-8">No orders today</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900 shadow-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-200">Order Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300">Total Orders</span>
              <span className="text-2xl font-bold text-blue-400">{orders.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300">Pending</span>
              <span className="text-2xl font-bold text-yellow-400">
                {orders.filter(o => o.status === 'PENDING').length}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300">Delivered</span>
              <span className="text-2xl font-bold text-green-400">
                {orders.filter(o => o.status === 'DELIVERED').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-60 animate-pulse" />
            Loading orders... <Spinner />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-60" />
            No orders found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-300">Order ID</TableHead>
                <TableHead className="text-gray-300">Customer</TableHead>
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-right text-gray-300">Total</TableHead>
                <TableHead className="text-right text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-gray-800 hover:bg-gray-800/40 transition-all">
                  <TableCell className="font-medium text-gray-200">#{order.id}</TableCell>
                  <TableCell className="text-gray-300">
                    <div>{order.user.firstName} {order.user.lastName}</div>
                    <div className="text-sm text-gray-500">{order.phone}</div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[order.status]} className={statusColorMap[order.status]}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-gray-200">
                    Rs. {order.total.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-200">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                        <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setSelectedOrder(order)} className="text-gray-200 hover:bg-gray-700">
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        {user?.role !== "ADMIN" && order.status === "DELIVERED" ? null : (
                          <>
                            <Separator className="bg-gray-700" />
                            <DropdownMenuLabel className="text-gray-400 text-xs">Update Status</DropdownMenuLabel>
                            {["CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUNDED"]
                              .filter((status) => allowedStatuses.includes(status))
                              .map((status) => (
                                <DropdownMenuItem
                                  key={status}
                                  onClick={() => triggerStatusChange(order.id, status)}
                                  className="text-gray-200 hover:bg-gray-700"
                                >
                                  {status.replace(/_/g, " ")}
                                </DropdownMenuItem>
                              ))}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Order Details Dialog - Keep the rest of your existing dialog code */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Order #{selectedOrder?.id} Details
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800/50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400">Customer</p>
                  <p className="font-medium text-gray-200">{selectedOrder.user.firstName} {selectedOrder.user.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="font-medium text-gray-200">{selectedOrder.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Address</p>
                  <p className="font-medium text-gray-200">{selectedOrder.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <Badge variant={statusVariantMap[selectedOrder.status]} className={statusColorMap[selectedOrder.status]}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-gray-200">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex justify-between text-gray-200">
                        <span>{item.quantity}x {item.foodItem.name}</span>
                        <span>Rs. {calculateItemSubtotal(item).toFixed(2)}</span>
                      </div>
                      {getCustomizationsArray(item.customizations).length > 0 && (
                        <div className="text-sm text-gray-400 mt-1">
                          + {getCustomizationsArray(item.customizations).map(c => c.name).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                <span className="font-bold text-lg text-gray-200">Total</span>
                <span className="font-bold text-2xl text-blue-400">Rs. {selectedOrder.total.toFixed(2)}</span>
              </div>

              {user?.role !== "CHEF" && (
                <Button onClick={handlePrintReceipt} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  <Printer className="mr-2 h-4 w-4" /> Print Receipt
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <DialogContent className="max-w-md bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">Confirm Status Change</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-300">
            Marking an order as DELIVERED cannot be undone. Are you sure you want to continue?
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setPendingAction(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (pendingAction) {
                  updateStatus(pendingAction.orderId, pendingAction.status);
                  setPendingAction(null);
                }
              }}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}