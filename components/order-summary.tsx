"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trash, Plus, Minus } from "lucide-react" // Import Plus and Minus icons
import { useCart } from "@/components/cart-provider"

const MAX_ITEM_QUANTITY = 5; // Your business rule

export function OrderSummary() {
  // 1. Get the updated state from the cart provider
  const { cart, removeFromCart, updateQuantity, subtotal } = useCart()

  // These calculations are correct
  const serviceChargeRate = 0.1
  const taxRate = 0.08
  const serviceCharge = subtotal * serviceChargeRate
  const tax = (subtotal + serviceCharge) * taxRate
  const total = subtotal + serviceCharge + tax

  // 2. Use `cart` instead of `items`
  if (!cart || cart.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Your cart is empty.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* 3. Map over `cart` */}
        {cart.map((item) => {
          // This logic is correct
          const customizationsPrice = item.customizations.reduce((sum, customization) => sum + customization.price, 0)
          const itemTotal = (item.price + customizationsPrice) * item.quantity

          return (
            // 4. Use the unique `cartItemId` for the key
            <div key={item.cartItemId} className="grid gap-2">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-md">
                  <Image src={item.image || "/img/placeholder.jpg"} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 grid gap-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{item.name}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      // 5. Use `cartItemId` for the remove function to fix the bug
                      onClick={() => removeFromCart(item.cartItemId)}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    {/* --- 6. INTEGRATE THE NEW QUANTITY CONTROLS HERE --- */}
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Qty:</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6" // Smaller buttons to fit the layout
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-4 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        disabled={item.quantity >= MAX_ITEM_QUANTITY}
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-semibold">Rs. {itemTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* This part of your original layout is preserved */}
              {item.customizations.length > 0 && (
                <div className="ml-20 text-sm text-muted-foreground">
                  <p className="font-medium">Customizations:</p>
                  <ul className="list-disc pl-4">
                    {item.customizations.map((customization) => (
                      <li key={customization.id}>
                        {customization.name} (+ Rs. {customization.price.toFixed(2)})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator />
            </div>
          )
        })}

        {/* This summary section is also preserved */}
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>Rs. {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Service Charge (10%)</span>
          <span>Rs. {serviceCharge.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax (8%)</span>
          <span>Rs. {tax.toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>Rs. {total.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  )
}