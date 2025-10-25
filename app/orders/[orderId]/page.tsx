import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getServerSession } from "@/lib/session";
import prisma from "@/lib/db";
import Link from "next/link";

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  CONFIRMED: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  PREPARING: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  READY_FOR_PICKUP: "bg-green-500/20 text-green-400 border-green-500/40",
  OUT_FOR_DELIVERY: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  DELIVERED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/40",
  REFUNDED: "bg-purple-500/20 text-purple-400 border-purple-500/40",
};

const currency = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 2,
});

const isStaffRole = (role: string) => ["ADMIN", "MANAGER", "CHEF", "WAITER", "STORE_KEEP", "DELIVERY_PERSON", "KITCHEN_HELPER", "STAFF"].includes(role);

export default async function OrderDetailsPage({ params }: { params: { orderId: string } }) {
  const session = await getServerSession();
  if (!session) {
    redirect(`/login?callbackUrl=/orders/${params.orderId}`);
  }

  const orderId = Number(params.orderId);
  if (!Number.isInteger(orderId)) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      items: {
        include: {
          foodItem: {
            select: {
              name: true,
              price: true,
              imageUrl: true,
            },
          },
        },
      },
      payments: true,
    },
  });

  if (!order) {
    notFound();
  }

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

  const orderItems = order.items.map((item) => {
    const customizations = normalizeCustomizations(item.customizations as unknown);
    const customizationsTotal = customizations.reduce((sum, custom) => sum + (custom?.price ?? 0), 0);
    const linePrice = Number(item.foodItem.price) + customizationsTotal;
    return {
      id: item.id,
      quantity: item.quantity,
      name: item.foodItem.name,
      unitPrice: linePrice,
      subtotal: linePrice * item.quantity,
      customizations,
    };
  });

  const totals = {
    subtotal: orderItems.reduce((sum, item) => sum + item.subtotal, 0),
  };

  const payments = order.payments.map((payment) => ({
    id: payment.id,
    status: payment.status,
    method: payment.method,
    amount: Number(payment.amount),
    transactionId: payment.transactionId,
    createdAt: new Date(payment.createdAt),
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
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderItems.map((item) => (
              <div key={item.id} className="rounded-lg border border-gray-800 bg-gray-900/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold">{item.quantity} × {item.name}</p>
                    {item.customizations.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {item.customizations.map((custom, index) => (
                          <li key={index}>• {custom.name} (+{currency.format(Number(custom?.price) || 0)})</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">{currency.format(item.unitPrice)}</p>
                    <p className="text-muted-foreground">Subtotal: {currency.format(item.subtotal)}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-gray-800 bg-gray-900/50">
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
                <p className="text-sm text-white">{order.address || "Pickup"}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button asChild variant="ghost" size="sm">
                <Link href="/profile?tab=orders">← Back to Orders</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/order-confirmation?orderId=${order.id}`}>
                  Get Receipt
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {payments.length > 0 && (
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle>Payments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {payments.map((payment) => (
                  <div key={payment.id} className="rounded-md border border-gray-800 bg-gray-900/40 p-3">
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
