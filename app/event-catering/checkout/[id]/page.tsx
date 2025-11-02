"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { StripePaymentForm } from "@/components/payment/StripePaymentForm";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EventCateringCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  interface Order {
    id: number;
    depositAmount: number;
    totalAmount: number;
    status: string;
    eventType: string;
    eventDate: string | Date;
    guestCount: number;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    menuItems?: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
  }

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState<string>("");
  const deliveryCharge = 300; // 300 LKR

  const orderId = parseInt(Array.isArray(params.id) ? params.id[0] : params.id || '0');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        
        // Fetch the order details
        const res = await fetch(`/api/event-catering/${orderId}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch order");
        }
        
        const { data: orderData } = await res.json();
        if (!orderData) {
          throw new Error("No order data received");
        }
        
        setOrder(orderData);

        // Add delivery charge of 300 LKR
        const deliveryCharge = 30000; // 300 LKR in cents
        const totalAmount = Math.round(orderData.depositAmount * 100) + deliveryCharge;
        
        // Initialize Stripe payment intent
        const paymentRes = await fetch("/api/event-catering/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            orderId,
            amount: totalAmount, // Includes deposit + delivery charge
            metadata: {
              depositAmount: Math.round(orderData.depositAmount * 100),
              deliveryCharge: deliveryCharge
            }
          }),
        });
        
        if (!paymentRes.ok) {
          const errorData = await paymentRes.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to initialize payment");
        }
        
        const { clientSecret } = await paymentRes.json();
        setClientSecret(clientSecret);
      } catch (err) {
        console.error("Checkout error:", err);
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load checkout",
          variant: "destructive",
        });
        // Redirect back to event catering page on error
        router.push("/event-catering");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, router, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Event Catering Checkout</h1>
        <p className="text-muted-foreground">Complete your event catering booking</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              {typeof window !== 'undefined' && clientSecret && order && (
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    A deposit of 25% is required to secure your booking. The remaining balance will be due 7 days before your event.
                  </p>
                  <StripePaymentForm 
                    orderId={orderId}
                    paymentIntentClientSecret={clientSecret}
                    onSuccess={() => {
                      router.push(`/event-catering/confirmation/${orderId}`);
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {order && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Event Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Event Type:</span>
                      <span className="text-right font-medium">{order.eventType}</span>
                      
                      <span className="text-muted-foreground">Event Date:</span>
                      <span className="text-right font-medium">
                        {new Date(order.eventDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      
                      <span className="text-muted-foreground">Guests:</span>
                      <span className="text-right font-medium">{order.guestCount}</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>Rs. {order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Charge:</span>
                      <span>Rs. {deliveryCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total Deposit (25% + Delivery):</span>
                      <span>Rs. {(order.depositAmount + deliveryCharge).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span>{order?.contactName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{order?.contactEmail}</span>
              </div>
              {order?.contactPhone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{order.contactPhone}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
