"use client";

import { CheckoutForm } from "@/components/checkout-form";
import { OrderSummary } from "@/components/order-summary";
import { StripePaymentForm } from "@/components/payment/StripePaymentForm";

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-lg shadow p-4">
            <h2 className="text-2xl font-semibold ml-5 my-4">Billing Information</h2>
            <CheckoutForm />
                    <h2 className="text-2xl font-semibold ml-5 my-4">Payment Method</h2>
            <div className="mt-4">
              <StripePaymentForm />
            </div>
          </div>
        </div>

        <div>
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
