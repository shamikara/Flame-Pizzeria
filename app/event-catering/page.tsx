"use client";

import { CateringForm } from "@/components/catering-form";
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { Loader2 } from "lucide-react";

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
  const { toast } = useToast();
  const router = useRouter();
  const { user, isLoading: sessionLoading } = useSession();

  const formatCurrency = useMemo(
    () =>
      new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        maximumFractionDigits: 0,
      }),
    []
  );

  const serviceCharge = subtotal * serviceChargeRate;
  const tax = subtotal * taxRate;
  const total = subtotal + serviceCharge + tax;
  const advancePayment = total * 0.25;

  const displayedSubtotal = submittedRequest?.totals?.subtotal ?? subtotal;
  const displayedServiceCharge = submittedRequest?.totals?.serviceCharge ?? serviceCharge;
  const displayedTax = submittedRequest?.totals?.tax ?? tax;
  const displayedTotal = submittedRequest?.totals?.total ?? total;
  const displayedDeposit = submittedRequest?.depositDue ?? advancePayment;

  useEffect(() => {
    if (submittedRequest?.id) {
      const checkPaymentStatus = async () => {
        try {
          const response = await fetch(`/api/payments/${submittedRequest.id}`);
          if (response.ok) {
            const payment = await response.json();
            if (payment) {
              setPaymentStatus(payment);
            }
          }
        } catch (error) {
          console.log('No payment found or error fetching payment status');
        }
      };

      checkPaymentStatus();
    }
  }, [submittedRequest?.id]);

  const updateBill = (newServices: ServiceItem[]) => {
    setServices(newServices);
    const newSubtotal = newServices.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setSubtotal(newSubtotal);
    // Reset form submission state when services change
    setIsFormSubmitted(false);
    // Only reset submittedRequest if form hasn't been submitted yet
    if (!isFormSubmitted) {
      setSubmittedRequest(null);
    }
  };

  const handleProceedToPayment = async () => {
    const depositRequired = submittedRequest?.depositDue ?? displayedDeposit;

    if (!submittedRequest) {
      toast({
        title: "Quote not ready",
        description: "Submit the catering form to generate a quote before paying the deposit.",
      });
      return;
    }

    // Check if payment is already completed
    if (paymentStatus?.status === 'COMPLETED') {
      toast({
        title: "Payment Already Completed",
        description: `A payment of ${formatCurrency.format(paymentStatus.amount)} has already been processed for this request.`,
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

    if (!user) {
      router.push(`/login?redirect=/event-catering/checkout/${submittedRequest.id}`);
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const response = await fetch("/api/catering/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: submittedRequest.id }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.log('Checkout API error response:', data);
        throw new Error(data.error || "Failed to initialise payment session");
      }

      const result = await response.json();
      console.log('Checkout API response:', result);

      if (response.ok && result.success && result.clientSecret) {
        // Redirect to payment page with Stripe client secret
        router.push(`/event-catering/checkout/${submittedRequest.id}`);
      } else if (result.error && result.details) {
        // Handle completed payment with details
        console.log('Payment already completed:', result.details);
        toast({
          title: "Payment Already Completed",
          description: `A payment of LKR ${result.details.amount} has already been processed for this request. Contact support if you need assistance.`,
          variant: "destructive",
        });
        throw new Error(result.error);
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
      <h1 className="text-4xl font-bold mb-8 flame-text text-center">Event Catering</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left side - Catering Form */}
        <div className="lg:flex-1">
          <CateringForm
            onServicesUpdate={updateBill}
            onSubmitSuccess={(payload) => {
              // Create the request data with all required fields
              const requestData = {
                id: payload.id,
                status: payload.status || 'PENDING',
                depositDue: payload.depositDue,
                totals: payload.totals || {
                  subtotal: subtotal,
                  serviceCharge: serviceCharge,
                  tax: tax,
                  total: total
                }
              };

              setSubmittedRequest(requestData);
              setIsFormSubmitted(true);

              toast({
                title: "Request submitted",
                description: "Review your quote and proceed to pay the 25% advance when ready.",
              });
            }}
            preventServicesUpdate={isFormSubmitted}
          />
        </div>

        {/* Right side - Bill Summary */}
        <div className="lg:w-96">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-xl">Your Bill</CardTitle>
            </CardHeader>
            <CardContent>
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
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency.format(service.price)} × {service.quantity}
                          </p>
                        </div>
                        <span className="font-medium">
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
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>{formatCurrency.format(displayedTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Advance payment (25%)</span>
                      <span>{formatCurrency.format(displayedDeposit)}</span>
                    </div>
                  </div>

                  {/* Payment Status Indicator */}
                  {paymentStatus && (
                    <div className={`mt-4 p-3 rounded-lg border ${
                      paymentStatus.status === 'COMPLETED'
                        ? 'bg-green-50 border-green-200'
                        : paymentStatus.status === 'FAILED'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            Payment Status: {paymentStatus.status}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Amount: {formatCurrency.format(paymentStatus.amount)}
                          </p>
                        </div>
                        {paymentStatus.status === 'COMPLETED' && (
                          <div className="text-green-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="mt-4 text-xs text-muted-foreground">
                    A 25% advance secures your booking. The remaining balance is due once menu and logistics are finalised.
                  </p>
                  <Button
                    className="mt-4 w-full"
                    disabled={sessionLoading || isCheckoutLoading || !submittedRequest || paymentStatus?.status === 'COMPLETED'}
                    onClick={handleProceedToPayment}
                  >
                    {isCheckoutLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Preparing payment…
                      </>
                    ) : paymentStatus?.status === 'COMPLETED' ? (
                      "Payment Completed"
                    ) : (
                      "Proceed to payment"
                    )}
                  </Button>
                  {submittedRequest && (
                    <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                      Editing the form will refresh the quote and require a new submission.
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}