'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, Clock, CheckCircle, XCircle, Truck, Loader2 } from 'lucide-react';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

interface OrderItem {
  id: string;
  quantity: number;
  foodItem: {
    name: string;
    price: number;
  };
  customizations: Array<{ name: string; price: number }>;
}

interface Order {
  id: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

const statusIcons = {
  PENDING: <Clock className="h-4 w-4 text-yellow-500" />,
  CONFIRMED: <CheckCircle className="h-4 w-4 text-blue-500" />,
  PREPARING: <Loader2 className="h-4 w-4 animate-spin text-orange-500" />,
  READY_FOR_PICKUP: <Package className="h-4 w-4 text-green-500" />,
  OUT_FOR_DELIVERY: <Truck className="h-4 w-4 text-blue-500" />,
  DELIVERED: <CheckCircle className="h-4 w-4 text-green-500" />,
  CANCELLED: <XCircle className="h-4 w-4 text-red-500" />,
  REFUNDED: <XCircle className="h-4 w-4 text-purple-500" />,
};

const statusColors = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PREPARING: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  READY_FOR_PICKUP: 'bg-green-500/20 text-green-400 border-green-500/30',
  OUT_FOR_DELIVERY: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  DELIVERED: 'bg-green-500/20 text-green-400 border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
  REFUNDED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orders/user-orders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
        <Package className="h-12 w-12 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-200">No orders yet</h3>
        <p className="max-w-md text-sm text-gray-400">
          You haven't placed any orders yet. Start exploring our menu to place your first order!
        </p>
        <Button asChild>
          <a href="/menu">Browse Menu</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Order History</h2>
      <ScrollArea className="h-[calc(100vh-250px)] pr-4">
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="border-gray-800 bg-gray-900/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg font-medium">
                    Order #{String(order.id).substring(0, 8).toUpperCase()}
                  </CardTitle>
                  <p className="text-sm text-gray-400">
                    {format(new Date(order.createdAt), 'MMMM d, yyyy h:mm a')}
                  </p>
                </div>
                <Badge
                  className={`inline-flex items-center gap-1.5 border ${statusColors[order.status]}`}
                >
                  {statusIcons[order.status]}
                  {order.status.replace(/_/g, ' ')}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div>
                          <p className="font-medium">
                            {item.quantity} × {item.foodItem.name}
                          </p>
                          {item.customizations.length > 0 && (
                            <div className="ml-4 mt-1 space-y-1">
                              {item.customizations.map((custom, idx) => (
                                <p key={idx} className="text-xs text-gray-400">
                                  • {custom.name}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="font-medium">
                          {formatCurrency(
                            (item.foodItem.price +
                              item.customizations.reduce(
                                (sum, c) => sum + (c.price || 0),
                                0
                              )) *
                              item.quantity
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                    <span className="text-sm text-gray-400">Total</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/orders/${order.id}`}>View Details</a>
                    </Button>
                    {order.status === 'DELIVERED' && (
                      <Button size="sm" asChild>
                        <a href="#">Reorder</a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
