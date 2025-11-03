import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { getServerSession } from "@/lib/session"
import prisma from "@/lib/db"
import Link from "next/link"
import { OrderItemWithReview } from "@/components/order-item-with-review"
import { format } from "date-fns"
import { PrintReceiptButton } from "@/components/print-receipt-button"

interface OrderItemWithCustomizations {
  id: number;
  quantity: number;
  price: number;
  foodItem: {
    id: number;
    name: string;
    price: number;
  };
  customizations?: Array<{
    id: number;
    name: string;
    price: number;
  }>;
}

interface OrderWithDetails {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  address: string;
  phone: string;
  deliveryFee?: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: OrderItemWithCustomizations[];
  payment: Array<{
    id: number;
    status: string;
    amount: number;
    method: string;
    transactionId: string | null;
    createdAt: Date;
  }>;
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/10",
  CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/10",
  PREPARING: "bg-orange-500/10 text-orange-400 border-orange-500/10",
  READY_FOR_PICKUP: "bg-green-500/10 text-green-400 border-green-500/10",
  OUT_FOR_DELIVERY: "bg-blue-500/10 text-blue-400 border-blue-500/10",
  DELIVERED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/10",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/10",
  REFUNDED: "bg-purple-500/10 text-purple-400 border-purple-500/10",
};

const currency = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 2,
});

const isStaffRole = (role: string) => ["ADMIN", "MANAGER", "CHEF", "WAITER", "STORE_KEEP", "DELIVERY_PERSON", "KITCHEN_HELPER", "STAFF"].includes(role);

export default async function OrderDetailsPage({ params }: { params: { orderId: string } }) {
  // Ensure params is properly awaited
  const { orderId } = await Promise.resolve(params);
  const session = await getServerSession();
  if (!session) {
    redirect(`/login?callbackUrl=/orders/${params.orderId}`);
  }

  const parsedOrderId = Number(orderId);
  if (!Number.isInteger(parsedOrderId)) {
    notFound();
  }

  // First, get the order with its items
  const order = await prisma.order.findUnique({
    where: { id: parsedOrderId },
    include: {
      user: { 
        select: { 
          id: true,
          firstName: true, 
          lastName: true, 
          email: true 
        } 
      },
      items: {
        include: {
          foodItem: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
            },
          },
        },
      },
      payment: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Get all food item IDs from the order
  const foodItemIds = order.items.map((item: any) => item.foodItemId);

  // Fetch all ratings for these food items by the current user
  const ratings = await prisma.rating.findMany({
    where: {
      foodItemId: { in: foodItemIds },
      userId: session.userId,
    },
  });

  // Create a map of foodItemId to rating
  const ratingMap = new Map(ratings.map(rating => [rating.foodItemId, rating]));

  // Add the rating to each order item
  const orderItemsWithRatings = order.items.map(item => ({
    ...item,
    review: ratingMap.get(item.foodItemId) || null,
  }));

  if (order.userId !== session.userId && !isStaffRole(session.role)) {
    notFound();
  }

  const createdAt = new Date(order.createdAt);
  const updatedAt = new Date(order.updatedAt);

  type RawCustomization = Record<string, unknown> | null | undefined;

  const normalizeCustomizations = (raw: unknown): { name: string; price: number }[] => {
    if (!Array.isArray(raw)) return [];
    return raw
      .map((entry: RawCustomization) => {
        if (!entry || typeof entry !== "object") return null;
        const nameValue = "name" in entry ? entry.name : undefined;
        const priceValue = "price" in entry ? entry.price : undefined;
        const name = typeof nameValue === "string" && nameValue.trim().length > 0 ? nameValue.trim() : null;
        const price = typeof priceValue === "number" ? priceValue : Number(priceValue);
        if (!name) return null;
        return { name, price: Number.isFinite(price) ? price : 0 };
      })
      .filter((entry): entry is { name: string; price: number } => Boolean(entry));
  };

  const orderItems = orderItemsWithRatings.map((item) => {
    const customizations = normalizeCustomizations(item.customizations as unknown);
    const customizationsTotal = customizations.reduce((sum, custom) => sum + (custom?.price ?? 0), 0);
    const linePrice = Number(item.foodItem.price) + customizationsTotal;
    
    // Format the review data if it exists
    const review = item.review ? {
      id: item.review.id.toString(),
      rating: item.review.stars,
      comment: item.review.comment || null,
      createdAt: item.review.createdAt.toISOString(),
    } : undefined;
    
    return {
      id: item.id,
      quantity: item.quantity,
      foodItem: {
        id: item.foodItem.id.toString(),
        name: item.foodItem.name,
        price: item.foodItem.price,
        imageUrl: item.foodItem.imageUrl || undefined,
      },
      customizations,
      linePrice,
      total: linePrice * item.quantity,
      review,
    };
  });

  const totals = {
    subtotal: orderItems.reduce((sum, item) => sum + item.total, 0),
  };

  const payments = (order.payment || []).map((payment: any) => ({
    id: payment.id,
    status: payment.status,
    method: payment.method,
    amount: payment.amount,
    transactionId: payment.transactionId,
    createdAt: payment.createdAt,
  }));

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Order #{order.id}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on {createdAt.toLocaleString()} · Last updated {updatedAt.toLocaleString()}
          </p>
        </div>
        <Badge className={statusStyles[order.status] ?? ""}>{order.status.replace(/_/g, " ")}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-gray-800 bg-gray-200/50 dark:bg-gray-900/50">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderItems.map((item) => {
              const orderItem = {
                id: item.id.toString(),
                quantity: item.quantity,
                foodItem: item.foodItem,
                customizations: item.customizations,
                review: item.review ? {
                  id: item.review.id,
                  rating: item.review.rating,
                  comment: item.review.comment,
                  createdAt: item.review.createdAt
                } : undefined
              };
              
              return (
                <OrderItemWithReview
                  key={item.id}
                  item={orderItem}
                  orderStatus={order.status}
                  orderId={order.id.toString()}
                />
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-gray-800 bg-gray-200/50 dark:bg-gray-900/50">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{currency.format(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total charged</span>
                <span>{currency.format(Number(order.total))}</span>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between text-muted-foreground">
                <span>Status</span>
                <span>{order.status.replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Contact</span>
                <span>{order.phone}</span>
              </div>
              <div className="text-muted-foreground">
                <span className="block text-xs uppercase tracking-wide">Delivery Address</span>
                <p className="text-sm text-gray-700 dark:text-gray-200">{order.address || "Pickup"}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button asChild variant="ghost" size="sm">
                <Link href="/profile?tab=orders">← Back to Orders</Link>
              </Button>
              <PrintReceiptButton 
                order={{
                  id: order.id,
                  createdAt: order.createdAt.toISOString(),
                  status: order.status,
                  total: order.total,
                  address: order.address,
                  phone: order.phone,
                  user: order.user,
                  items: order.items.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    foodItem: {
                      name: item.foodItem.name,
                      price: item.foodItem.price
                    },
                    customizations: item.customizations ? JSON.parse(JSON.stringify(item.customizations)) : []
                  }))
                }} 
              />
            </CardFooter>
          </Card>

          {payments.length > 0 && (
            <Card className="border-gray-800 bg-gray-200/50 dark:bg-gray-900/50">
              <CardHeader>
                <CardTitle>Payments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {payments.map((payment) => (
                  <div key={payment.id} className="rounded-md border border-gray-800 bg-gray-100/60 dark:bg-gray-900/40 p-3">
                    <div className="flex justify-between">
                      <span className="font-medium">{currency.format(payment.amount)}</span>
                      <Badge variant="outline">{payment.status}</Badge>
                    </div>
                    <p className="text-muted-foreground">{payment.method}</p>
                    <p className="text-xs text-muted-foreground">
                      {payment.transactionId ? `Txn: ${payment.transactionId}` : "Manual entry"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payment.createdAt.toLocaleString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
