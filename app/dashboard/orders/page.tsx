"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { OrderForm } from "@/components/order-form";
import { PopularItemsPieChart } from "@/components/charts/popular-items-pie-chart";

type OrderWithDetails = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  address: string;
  phone: string;
  user: { firstName: string; lastName: string };
};

type MinimalUser = { id: string; firstName: string; lastName: string };
type PopularItemData = { name: string; count: number };

const statusVariantMap: Record<string, "secondary" | "outline" | "default" | "destructive"> = {
  PENDING: "secondary",
  CONFIRMED: "outline",
  PREPARING: "outline",
  READY_FOR_PICKUP: "outline",
  OUT_FOR_DELIVERY: "outline",
  DELIVERED: "default",
  CANCELLED: "destructive",
  REFUNDED: "destructive",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [users, setUsers] = useState<MinimalUser[]>([]);
  const [popularItems, setPopularItems] = useState<PopularItemData[]>([]);
  const [isAddOrderDialogOpen, setIsAddOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);

  const fetchAllData = async () => {
    try {
      const [ordersRes, usersRes, popularItemsRes] = await Promise.all([
        fetch("/api/orders/list"),
        fetch("/api/users/list"),
        fetch("/api/orders/today-popular"),
      ]);
      setOrders(await ordersRes.json());
      setUsers(await usersRes.json());
      setPopularItems(await popularItemsRes.json());
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
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

  useEffect(() => { fetchAllData(); }, []);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-3">
          <PopularItemsPieChart data={popularItems} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold tracking-tight">Manage Orders</h2>
          <Dialog open={isAddOrderDialogOpen} onOpenChange={setIsAddOrderDialogOpen}>
            <DialogTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Order</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
              </DialogHeader>
              <OrderForm users={users} onFormSubmit={() => { setIsAddOrderDialogOpen(false); fetchAllData(); }} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id}</TableCell>
                  <TableCell>{`${order.user.firstName} ${order.user.lastName}`}</TableCell>
                  <TableCell><Badge variant={statusVariantMap[order.status] || "secondary"}>{order.status}</Badge></TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right">Rs. {order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setSelectedOrder(order)}>View Details</DropdownMenuItem>
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        {["CONFIRMED","PREPARING","READY_FOR_PICKUP","OUT_FOR_DELIVERY","DELIVERED","CANCELLED"].map(s => (
                          <DropdownMenuItem key={s} onClick={() => updateStatus(order.id, s)}>Mark as {s.replaceAll("_"," ")}</DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 text-sm">
              <p><strong>Order ID:</strong> <span className="font-mono text-xs">{selectedOrder.id}</span></p>
              <p><strong>Customer:</strong> {selectedOrder.user.firstName} {selectedOrder.user.lastName}</p>
              <Separator />
              <h4 className="font-semibold">Shipping Information</h4>
              <p><strong>Address:</strong> {selectedOrder.address}</p>
              <p><strong>Phone:</strong> {selectedOrder.phone}</p>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total Amount:</span>
                <span>Rs. {selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
