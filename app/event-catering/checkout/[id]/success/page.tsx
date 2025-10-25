"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";

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
}

export default function EventCateringPaymentSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [request, setRequest] = useState<CateringRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const requestId = params.id as string;
  const paymentIntent = searchParams.get('payment_intent');

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
          setRequest(data);

          // Show success message
          if (paymentIntent) {
            toast({
              title: "Payment successful!",
              description: "Your catering deposit has been processed successfully.",
            });
          }
        } else {
          toast({
            title: "Request not found",
            description: "The catering request could not be found.",
            variant: "destructive",
          });
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
  }, [requestId, paymentIntent, toast]);

  if (loading) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Your catering deposit has been processed successfully.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Catering Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Request ID</p>
                <p className="text-muted-foreground">#{request.id}</p>
              </div>
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
              <div>
                <p className="font-medium">Status</p>
                <p className="text-muted-foreground capitalize">{request.status}</p>
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
                <span>Deposit Paid (25%)</span>
                <span className="text-green-600">{formatCurrency.format(deposit)}</span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="font-medium text-green-800">Deposit Confirmed</p>
                  <p className="text-sm text-green-600">
                    Your booking is now secured! We'll contact you soon to finalize the details.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/event-catering")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Event Catering
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              A confirmation email has been sent to {request.contactEmail}. The remaining balance is due once menu and logistics are finalised.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
