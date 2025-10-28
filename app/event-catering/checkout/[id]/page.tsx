"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/components/session-provider";
import { Loader2, ArrowLeft } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

interface CateringRequest {
  id: number;
  status: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  contactName: string;
  contactEmail: string;
  menuItems: any;
  specialRequests: string | null;
  totals?: {
    subtotal: number;
    serviceCharge: number;
    tax: number;
    total: number;
  } | null;
  depositDue: number | null;
}

interface PaymentData {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentForm({ paymentData, request, formatCurrency }: {
  paymentData: PaymentData;
  request: CateringRequest;
  formatCurrency: Intl.NumberFormat;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Error",
        description: "Stripe has not been properly initialized.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // First, confirm the payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/event-catering/checkout/${request.id}/success`,
        },
        redirect: 'if_required', // Don't redirect automatically
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      // Verify the payment with our server
      const response = await fetch(`/api/event-catering/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntent?.id,
          requestId: request.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Payment verification failed');
      }

      // Only mark as successful if both Stripe and server verification pass
      if (paymentIntent?.status === 'succeeded') {
        // Update the request status in the database
        await fetch(`/api/event-catering/update-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requestId: request.id,
            status: 'payment_received',
          }),
        });

        // Redirect to success page
        router.push(`/event-catering/checkout/${request.id}/success`);
      } else {
        throw new Error('Payment not completed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || isProcessing}
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${formatCurrency.format(paymentData.amount)}`
        )}
      </Button>
    </form>
  );
}

export default function EventCateringCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: sessionLoading } = useSession();

  const [request, setRequest] = useState<CateringRequest | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);

  const requestId = params.id as string;

  const formatCurrency = useMemo(
    () =>
      new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        maximumFractionDigits: 0,
      }),
    []
  );

  useEffect(() => {
    if (!requestId) return;

    const fetchRequest = async () => {
      try {
        const response = await fetch(`/api/catering/${requestId}`);
        if (response.ok) {
          const data = await response.json();

          // If totals are missing from stored data, try to calculate from billSnapshot
          if (!data.menuItems?.totals && data.menuItems?.billSnapshot) {
            const billSnapshot = data.menuItems.billSnapshot;
            data.menuItems.totals = {
              subtotal: billSnapshot.subtotal,
              serviceCharge: billSnapshot.serviceCharge,
              tax: billSnapshot.tax,
              total: billSnapshot.total,
            };
            data.menuItems.depositDue = billSnapshot.total * 0.25;
          }

          setRequest(data);
        } else {
          toast({
            title: "Request not found",
            description: "The catering request could not be found.",
            variant: "destructive",
          });
          router.push("/event-catering");
        }
      } catch (error) {
        console.error("Error fetching request:", error);
        toast({
          title: "Error",
          description: "Failed to load catering request.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [requestId, toast, router]);

  useEffect(() => {
    if (!request) return;

    const initiatePayment = async () => {
      try {
        const response = await fetch("/api/catering/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId }),
        });

        if (response.ok) {
          const data = await response.json();
          setPaymentData(data);
        } else {
          const errorData = await response.json();
          toast({
            title: "Payment initialization failed",
            description: errorData.error || "Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error initiating payment:", error);
        toast({
          title: "Payment initialization failed",
          description: "Please try again or contact support.",
          variant: "destructive",
        });
      }
    };

    initiatePayment();
  }, [request, requestId, toast]);

  if (loading || sessionLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Request Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The catering request could not be found.
          </p>
          <Button onClick={() => router.push("/event-catering")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event Catering
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = request.menuItems?.totals?.subtotal || 0;
  const serviceCharge = request.menuItems?.totals?.serviceCharge || 0;
  const tax = request.menuItems?.totals?.tax || 0;
  const total = request.menuItems?.totals?.total || 0;
  const deposit = request.menuItems?.depositDue || 0;

  if (!paymentData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/event-catering")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Event Catering
            </Button>
            <h1 className="text-3xl font-bold">Payment for Catering Request</h1>
            <p className="text-muted-foreground">Request #{request.id}</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Initializing payment...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/event-catering")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event Catering
          </Button>
          <h1 className="text-3xl font-bold">Payment for Catering Request</h1>
          <p className="text-muted-foreground">Request #{request.id}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Event Type</p>
                <p className="text-muted-foreground capitalize">{request.eventType}</p>
              </div>
              <div>
                <p className="font-medium">Event Date</p>
                <p className="text-muted-foreground">
                  {new Date(request.eventDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="font-medium">Guest Count</p>
                <p className="text-muted-foreground">{request.guestCount} guests</p>
              </div>
              <div>
                <p className="font-medium">Contact</p>
                <p className="text-muted-foreground">{request.contactName}</p>
                <p className="text-muted-foreground text-xs">{request.contactEmail}</p>
              </div>
            </div>

            {request.specialRequests && (
              <div>
                <p className="font-medium">Special Requests</p>
                <p className="text-muted-foreground text-sm">{request.specialRequests}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency.format(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Service charge (10%)</span>
                <span>{formatCurrency.format(serviceCharge)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Tax (8%)</span>
                <span>{formatCurrency.format(tax)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency.format(total)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>Advance Payment (25%)</span>
                <span>{formatCurrency.format(deposit)}</span>
              </div>
            </div>

            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: paymentData.clientSecret,
                appearance: {
                  theme: 'stripe',
                },
              }}
            >
              <PaymentForm paymentData={paymentData} request={request} formatCurrency={formatCurrency} />
            </Elements>

            <p className="text-xs text-muted-foreground text-center mt-4">
              A 25% advance secures your booking. The remaining balance is due once menu and logistics are finalised.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
