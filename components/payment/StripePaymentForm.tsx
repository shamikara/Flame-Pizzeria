"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Load publishable key from env
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

export function StripePaymentForm() {
  const { cart } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Create user + order + payment intent when cart changes
  useEffect(() => {
    let cancelled = false;

    async function initPayment() {
      if (!cart || cart.length === 0) {
        setClientSecret(null);
        return;
      }

      try {
        setIsLoading(true);

        // Step 1: Ensure user exists or auto-create
        const userEmail = localStorage.getItem("userEmail");
        const userName = localStorage.getItem("userName") || "Guest User";

        const userRes = await fetch("/api/ensure-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, name: userName }),
        });

        const userData = await userRes.json();
        if (!userRes.ok || !userData?.id) throw new Error("User setup failed");

        // Step 2: Create a pending order
        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userData.id,
            total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
            status: "PENDING",
            type: "ONLINE",
          }),
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok || !orderData?.id)
          throw new Error("Failed to create order");

        // Save order ID for payment confirmation
        localStorage.setItem("last-order-id", orderData.id);

        // Step 3: Create PaymentIntent
        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart }),
        });

        const data = await res.json();
        if (!res.ok || !data?.clientSecret)
          throw new Error(data?.error || "Failed to initialize payment");

        if (!cancelled) setClientSecret(data.clientSecret);
      } catch (e: any) {
        toast({
          title: "Setup failed",
          description: e.message || "Unable to initialize payment.",
          variant: "destructive",
        });
        setClientSecret(null);
      } finally {
        setIsLoading(false);
      }
    }

    initPayment();
    return () => {
      cancelled = true;
    };
  }, [cart, toast]);

  const options = useMemo(
    () =>
      clientSecret
        ? ({
            clientSecret,
            appearance: { theme: "stripe" },
          } as const)
        : undefined,
    [clientSecret]
  );

  if (!stripePromise) {
    return (
      <div className="text-sm text-red-600">
        Stripe not configured. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {isLoading && <div className="text-sm">Preparing payment...</div>}
        {!isLoading && !clientSecret && (
          <div className="text-sm text-muted-foreground">
            Add items to cart to proceed with payment.
          </div>
        )}
        {options && (
          <Elements stripe={stripePromise} options={options}>
            <InnerPaymentForm />
          </Elements>
        )}
      </CardContent>
    </Card>
  );
}

function InnerPaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { clearCart } = useCart();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url:
          typeof window !== "undefined"
            ? window.location.origin + "/order-confirmation"
            : undefined,
      },
    });

    const stripeError = (result as any).error;
    const paymentIntent = (result as any).paymentIntent;

    if (stripeError) {
      toast({
        title: "Payment failed",
        description: stripeError.message || "Try another method.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      try {
        const orderId =
          typeof window !== "undefined"
            ? localStorage.getItem("last-order-id")
            : null;

        if (orderId) {
          await fetch("/api/orders/mark-paid", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              paymentIntentId: paymentIntent.id,
              amount: paymentIntent.amount_received
                ? paymentIntent.amount_received / 100
                : undefined,
            }),
          });
        }
      } catch (e) {
        console.error("Failed to mark order as paid:", e);
      }

      clearCart();
      toast({
        title: "Payment Successful!",
        description: "Your order has been placed successfully.",
        duration: 5000,
      });

      setTimeout(() => {
        router.push("/order-confirmation");
      }, 1500);
    }

    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement id="payment-element" />
      <Button type="submit" className="w-full" disabled={!stripe || !elements || submitting}>
        {submitting ? "Processing..." : "Pay now"}
      </Button>
    </form>
  );
}
