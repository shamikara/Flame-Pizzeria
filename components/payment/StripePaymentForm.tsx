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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface StripePaymentFormProps {
  orderId?: number | null;
}

export function StripePaymentForm({ orderId: propOrderId }: StripePaymentFormProps = {}) {
  const { cart } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get order ID from prop or localStorage
    const storedOrderId = propOrderId?.toString() || localStorage.getItem("last-order-id");
    setOrderId(storedOrderId);

    if (!storedOrderId) {
      setClientSecret(null);
      return;
    }

    if (!cart || cart.length === 0) {
      setClientSecret(null);
      return;
    }

    let cancelled = false;

    async function initPayment() {
      try {
        setIsLoading(true);

        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart }),
        });

        const data = await res.json();
        if (!res.ok || !data?.clientSecret) {
          throw new Error(data?.error || "Failed to initialize payment");
        }

        if (!cancelled) setClientSecret(data.clientSecret);
      } catch (e: any) {
        toast({
          title: "Payment setup failed",
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
  }, [cart, toast, propOrderId]);

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
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Stripe not configured. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
        </AlertDescription>
      </Alert>
    );
  }

  if (!orderId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please complete the billing information and place your order first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {isLoading && (
          <div className="flex items-center justify-center py-4 text-sm">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Preparing payment...
          </div>
        )}
        {!isLoading && !clientSecret && cart.length === 0 && (
          <div className="text-sm text-muted-foreground">
            Add items to cart to proceed with payment.
          </div>
        )}
        {options && (
          <Elements stripe={stripePromise} options={options}>
            <InnerPaymentForm orderId={orderId} />
          </Elements>
        )}
      </CardContent>
    </Card>
  );
}

function InnerPaymentForm({ orderId }: { orderId: string }) {
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
        description: stripeError.message || "Try another payment method.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      try {
        // Confirm payment and update order status to CONFIRMED
        await fetch("/api/orders/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            paymentIntentId: paymentIntent.id,
          }),
        });

        clearCart();
        // Store the confirmed order ID for the confirmation page
        localStorage.setItem('last-confirmed-order-id', orderId);
        localStorage.removeItem("last-order-id");

        toast({
          title: "Payment Successful!",
          description: "Your order has been confirmed.",
          duration: 5000,
        });

        setTimeout(() => {
          router.push(`/order-confirmation?orderId=${orderId}`);
        }, 1500);
      } catch (e) {
        console.error("Failed to confirm payment:", e);
        toast({
          title: "Payment processed",
          description: "But failed to update order. Please contact support.",
          variant: "destructive",
        });
      }
    }

    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement id="payment-element" />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || !elements || submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          "Pay Now"
        )}
      </Button>
    </form>
  );
}