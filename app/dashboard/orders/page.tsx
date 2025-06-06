"use client"; // Important for managing dialog state


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Badge, MoreHorizontal, PlusCircle } from "lucide-react";
import { OrderForm } from '@/components/order-form'; // Import the new form
import { User } from '@prisma/client';
import { useState, useEffect } from "react";

// We can no longer use a top-level async function because this is a client component.
// We'll fetch data using useEffect.

type OrderWithUser = {
  id: string;
  total: number;
  status: string;
  createdAt: Date;
  user: {
    firstName: string;
    lastName: string;
  };
};

const statusVariantMap: { [key: string]: "secondary" | "outline" | "default" | "destructive" } = {
    PENDING: "secondary",
    CONFIRMED: "secondary",
    PREPARING: "outline",
    READY_FOR_PICKUP: "default",
    OUT_FOR_DELIVERY: "default",
    DELIVERED: "default",
    CANCELLED: "destructive",
    REFUNDED: "destructive",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithUser[]>([]);
  const [users, setUsers] = useState<Pick<User, 'id' | 'firstName' | 'lastName'>[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Function to fetch orders
  const fetchOrders = async () => {
    const res = await fetch('/api/orders/list'); // We'll create this simple list API
    const data = await res.json();
    setOrders(data);
  };
  
  // Function to fetch users for the form
  const fetchUsers = async () => {
      const res = await fetch('/api/users/list'); // And this one too
      const data = await res.json();
      setUsers(data);
  }

  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Manage Orders</h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Order</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
            </DialogHeader>
            <OrderForm users={users} onFormSubmit={() => {
                setIsDialogOpen(false); // Close dialog on success
                fetchOrders(); // Refresh the order list
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
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">{order.id}</TableCell>
                <TableCell className="font-medium">
                  {`${order.user.firstName} ${order.user.lastName}`}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariantMap[order.status] || 'secondary'}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  Rs. {order.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Mark as Preparing</DropdownMenuItem>
                      <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}