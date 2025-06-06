"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trash } from "lucide-react"
import { useCart } from "@/components/cart-provider"

export function OrderSummary() {
  const { items, removeItem, updateQuantity, subtotal } = useCart()

  // Calculate tax and total
  const tax = subtotal * 0.08
  const total = subtotal + tax

  if (items.length === 0) {
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
        {items.map((item) => {
          // Calculate item total with customizations
          const customizationsPrice = item.customizations.reduce((sum, customization) => sum + customization.price, 0)
          const itemTotal = (item.price + customizationsPrice) * item.quantity

          return (
            <div key={`${item.id}-${JSON.stringify(item.customizations)}`} className="grid gap-2">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-md">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 grid gap-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{item.name}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>Qty: {item.quantity}</span>
                      <span className="text-muted-foreground">Rs.{item.price.toFixed(2)}</span>
                    </div>
                    <span>Rs. {itemTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

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

        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>Rs. {subtotal.toFixed(2)}</span>
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
