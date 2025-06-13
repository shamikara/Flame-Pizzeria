"use client";

import { useState, useEffect } from "react";
import { User } from '@prisma/client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { OrderForm } from '@/components/order-form';
import { PopularItemsPieChart } from "@/components/charts/popular-items-pie-chart";
// --- TYPE DEFINITIONS ---
type OrderWithDetails = {
  id: string;
  total: number;
  status: string;
  createdAt: Date;
  address: string;
  phone: string;
  user: {
    firstName: string;
    lastName: string;
  };
};

type PopularItemData = {
  name: string;
  count: number;
};

// --- COMPONENT LOGIC ---
const statusVariantMap: { [key: string]: "secondary" | "outline" | "default" | "destructive" } = {
    PENDING: "secondary", PROCESSING: "outline", COMPLETED: "default", CANCELLED: "destructive",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [users, setUsers] = useState<Pick<User, 'id' | 'firstName' | 'lastName'>[]>([]);
  const [popularItems, setPopularItems] = useState<PopularItemData[]>([]);
  const [isAddOrderDialogOpen, setIsAddOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);

  const fetchAllData = async () => {
    // Fetch all data in parallel for better performance
    const [ordersRes, usersRes, popularItemsRes] = await Promise.all([
      fetch('/api/orders/list'),
      fetch('/api/users/list'),
      fetch('/api/orders/today-popular')
    ]);
    
    const ordersData = await ordersRes.json();
    const usersData = await usersRes.json();
    const popularItemsData = await popularItemsRes.json();

    setOrders(ordersData);
    setUsers(usersData);
    setPopularItems(popularItemsData);
  };


  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Section 1: Data Visualization */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-3">
          <PopularItemsPieChart data={popularItems} />
        </div>
        {/* You can add more chart cards here in the future */}
      </div>

      {/* Section 2: Order Management Table */}
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
              <OrderForm users={users} onFormSubmit={() => {
                  setIsAddOrderDialogOpen(false);
                  fetchAllData(); // Refresh all data on new order
              }} />
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
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id}</TableCell>
                  <TableCell className="font-medium">{`${order.user.firstName} ${order.user.lastName}`}</TableCell>
                  <TableCell><Badge variant={statusVariantMap[order.status] || 'secondary'}>{order.status}</Badge></TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right">Rs. {order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setSelectedOrder(order)}>View Details</DropdownMenuItem>
                        {/* More actions can be added here */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog for Viewing Order Details */}
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