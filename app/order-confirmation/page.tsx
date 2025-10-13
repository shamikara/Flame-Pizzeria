"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrderConfirmationPage() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the last order ID from localStorage or URL params
    const params = new URLSearchParams(window.location.search);
    const urlOrderId = params.get('orderId');
    const storedOrderId = localStorage.getItem('last-confirmed-order-id') || localStorage.getItem('last-order-id');
    
    setOrderId(urlOrderId || storedOrderId);
    setLoading(false);

    // Clear the order ID from localStorage after displaying
    if (storedOrderId) {
      localStorage.removeItem('last-order-id');
    }
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p>
            Thank you for your order. We've received your payment and your order is being prepared.
          </p>
          <div className="bg-muted p-4 rounded-md">
            <p className="font-medium">Order #{orderId || 'N/A'}</p>
            <p className="text-sm text-muted-foreground">Estimated delivery: 30-45 minutes</p>
          </div>
          <p className="text-sm text-muted-foreground">
            You can track your order status from your account dashboard.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button asChild className="w-full">
            <Link href="/shop">Order More Food</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}