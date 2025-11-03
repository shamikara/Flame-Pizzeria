'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, Clock, CheckCircle, XCircle, Truck, Loader2, RefreshCw } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

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
  const [reordering, setReordering] = useState<string | null>(null);

  const { addToCart, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();

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

  const handleReorder = async (order: Order) => {
    try {
      setReordering(order.id);

      // Clear current cart and add all items from this order
      clearCart();

      // Add each item from the order to the cart
      for (const item of order.items) {
        addToCart({
          productId: item.foodItem.name, // Using name as productId for now
          name: item.foodItem.name,
          price: item.foodItem.price,
          image: '', // No image available from order history
          customizations: item.customizations.map(c => ({
            id: Math.random(), // Generate temporary ID
            name: c.name,
            price: c.price || 0
          }))
        }, item.quantity);
      }

      toast({
        title: "Order items added to cart!",
        description: `Added ${order.items.length} items from Order #${String(order.id).substring(0, 8).toUpperCase()} to your cart.`,
      });

      // Navigate to shop page
      router.push('/shop');

    } catch (error) {
      console.error('Error reordering:', error);
      toast({
        title: "Failed to reorder",
        description: "There was an error adding items to your cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setReordering(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg bg-gray-200 dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center">
        <Package className="h-14 w-14 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No orders yet</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Your order history will appear here</p>
        <Button 
          variant="default" 
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => router.push('/menu')}
        >
          Browse Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="px-1">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Order History</h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-2 -mr-4">
          <div className="space-y-4 pr-4">
            {orders.map((order) => (
              <Card key={order.id} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 mr-2.5 text-orange-500 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Order #{String(order.id).slice(-6).toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(order.createdAt), 'MMM d, yyyy - h:mm a')}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${statusColors[order.status]} flex items-center gap-1.5 py-1 px-2.5 rounded-full border-none text-xs font-medium`}
                    >
                      {statusIcons[order.status]}
                      {order.status.replace(/_/g, ' ').toLowerCase()}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-0">
                  <div className="p-4 space-y-4">
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {item.quantity} × {item.foodItem.name}
                            </p>
                            {item.customizations.length > 0 && (
                              <div className="ml-4 mt-1 space-y-1">
                                {item.customizations.map((custom, idx) => (
                                  <p key={idx} className="text-xs text-gray-500 dark:text-gray-400 flex items-start">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mt-1.5 mr-1.5 flex-shrink-0"></span>
                                    <span className="truncate">{custom.name}</span>
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
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
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-800 space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-8 px-3 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => router.push(`/orders/${order.id}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      className="text-xs h-8 px-3 bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => handleReorder(order)} 
                      disabled={reordering === order.id}
                    >
                      {reordering === order.id ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Adding...
                        </>
                      ) : 'Reorder'}
                    </Button>
                  </div>
                </CardContent>
                </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
