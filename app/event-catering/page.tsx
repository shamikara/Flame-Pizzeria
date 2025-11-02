"use client";

import { CateringForm } from "@/components/catering-form";
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { Spinner } from "@/components/ui/spinner";
import { Loader2 } from "lucide-react";
import { LoginDialog } from "@/components/auth/login-dialog";

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

type SubmittedRequest = {
  id: number;
  status: string;
  totals: {
    subtotal: number | null;
    serviceCharge: number | null;
    tax: number | null;
    total: number | null;
  } | null;
  depositDue: number | null;
};

export default function EventCateringPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const taxRate = 0.08; // 8% tax
  const serviceChargeRate = 0.1; // 10% service charge
  const [submittedRequest, setSubmittedRequest] = useState<SubmittedRequest | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<{
    status: string;
    amount: number;
    id: number;
  } | null>(null);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  // Your custom useSession hook returns the session data directly.
  const session = useSession();
  // Destructure only the properties that exist on your custom hook's return type.
  const { user, refreshSession } = session;
  const router = useRouter();
  const { toast } = useToast();

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
    // Your custom session provider doesn't have a 'status'.
    // We can determine the loading state by checking if the session object is available.
    // The `user` property will be null or an object once loaded.
    setIsSessionLoading(false);
  }, [session]);

  const serviceCharge = subtotal * serviceChargeRate;
  const tax = subtotal * taxRate;
  const total = subtotal + serviceCharge + tax;
  const advancePayment = total * 0.25;

  const displayedSubtotal = submittedRequest?.totals?.subtotal ?? subtotal;
  const displayedServiceCharge = submittedRequest?.totals?.serviceCharge ?? serviceCharge;
  const displayedTax = submittedRequest?.totals?.tax ?? tax;
  const displayedTotal = submittedRequest?.totals?.total ?? total;
  const displayedDeposit = submittedRequest?.depositDue ?? advancePayment;

  const handleProceedToPayment = async () => {
    const depositRequired = submittedRequest?.depositDue ?? displayedDeposit;

    if (!submittedRequest) {
      toast({
        title: "Quote not ready",
        description: "Submit the catering form to generate a quote before paying the deposit.",
      });
      return;
    }

    if (!depositRequired || depositRequired <= 0) {
      toast({
        title: "Deposit unavailable",
        description: "We couldn't calculate the advance. Please review the form and submit again.",
        variant: "destructive",
      });
      return;
    }

    setIsCheckoutLoading(true);
    try {
      // Let the server handle authentication, just like the food order checkout.
      const response = await fetch("/api/catering/checkout", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ 
          requestId: submittedRequest.id
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.log('Checkout API error response:', data);
        // If the server says login is required, show the dialog.
        if (data.requiresLogin) {
          setShowLoginDialog(true);
          setIsCheckoutLoading(false); // Stop loading spinner
        }
        throw new Error(data.error || "Failed to initialise payment session");
      }

      const result = await response.json();
      console.log('Checkout API response:', result);

      // The API now returns the cateringRequestId on success.
      // We use this to redirect to the checkout page.
      if (result.success && result.cateringRequestId) {
        router.push(`/event-catering/checkout/${submittedRequest.id}`);
      } else {
        throw new Error(result.error || "Failed to initiate payment");
      }
    } catch (error: any) {
      console.error("Proceed to payment error:", error);
      toast({
        title: "Unable to start payment",
        description: error.message || "Please try again shortly.",
        variant: "destructive",
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8 flame-text text-center text-foreground">Event Catering</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left side - Catering Form */}
        <div className="lg:flex-1">
          <CateringForm
            {...({
              onServicesUpdate: (newServices: ServiceItem[]) => {
                // Only update if not in a submitted state
                if (isFormSubmitted) return;
                setServices(newServices);
              },
              onFormReset: () => {
                setIsFormSubmitted(false);
                setSubmittedRequest(null);
                setIsSubmitting(false);
              },
              onBeforeSubmit: () => setIsSubmitting(true),
              onSubmitSuccess: (payload: any) => {
                setSubmittedRequest({
                  id: payload.id,
                  status: payload.status || 'PENDING',
                  depositDue: payload.depositDue,
                  totals: payload.totals,
                });
                // This is the key: set submitted to true and submitting to false
                setIsFormSubmitted(true);
                setIsSubmitting(false);

                toast({
                  title: "Request submitted",
                  description: "Review your quote and proceed to pay the 25% advance when ready.",
                });
              },
              preventServicesUpdate: isSubmitting || isFormSubmitted,
            } as any)}
          />
        </div>

        {/* Right side - Bill Summary */}
        <div className="lg:w-96">
          <Card className="sticky top-8" key={submittedRequest ? `submitted-${submittedRequest.id}` : 'new'}>
            <CardHeader>
              <CardTitle className="text-xl text-card-foreground">Your Bill</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {services.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Select services to see your bill
                </p>
              ) : (
                <>
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service.id} className="flex justify-between">
                        <div>
                          <p className="font-medium text-card-foreground">{service.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency.format(service.price)} × {service.quantity}
                          </p>
                        </div>
                        <span className="font-medium text-card-foreground">
                          {formatCurrency.format(service.price * service.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency.format(displayedSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Service charge ({(serviceChargeRate * 100).toFixed(0)}%)</span>
                      <span>{formatCurrency.format(displayedServiceCharge)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
                      <span>{formatCurrency.format(displayedTax)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t text-card-foreground">
                      <span>Total</span>
                      <span>{formatCurrency.format(displayedTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Advance payment (25%)</span>
                      <span>{formatCurrency.format(displayedDeposit)}</span>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-muted-foreground">
                    A 25% advance secures your booking. The remaining balance is due once menu and logistics are finalised.
                  </p>
                  {isSessionLoading ? (
                    <div className="flex justify-center items-center mt-6">
                      <Spinner />
                    </div>
                  ) : (
                    <div className="mt-6 space-y-4">
                      <Button
                        onClick={handleProceedToPayment}
                        className="w-full"
                        size="lg"
                        disabled={!isFormSubmitted || isCheckoutLoading}
                      >
                        {isCheckoutLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Proceed to Payment"
                        )}
                      </Button>
                      
                      {!user && (
                        <p className="text-sm text-center text-muted-foreground">
                          You'll need to log in to complete your payment
                        </p>
                      )}
                    </div>
                  )}
                  <LoginDialog 
                    open={showLoginDialog} 
                    onOpenChange={setShowLoginDialog}
                    onSuccess={async () => {
                      // The dialog's job is just to close itself.
                      // The page will be reloaded by the dialog to pick up the new session.
                      // The user can then click the button again.
                      setShowLoginDialog(false);
                    }}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}