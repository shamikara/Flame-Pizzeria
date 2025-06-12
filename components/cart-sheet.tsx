"use client"

import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, ShoppingCart, Plus, Minus } from "lucide-react"

// A helper for formatting currency
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", // You can change this to "LKR" for Sri Lankan Rupees or other currency
  }).format(price);
};

const MAX_ITEM_QUANTITY = 5;

export function CartSheet() {
  const { cart, removeFromCart, updateQuantity, subtotal, itemCount } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {itemCount}
            </span>
          )}
          <span className="sr-only">Open Cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-4">
          <SheetTitle>My Cart ({itemCount})</SheetTitle>
        </SheetHeader>
        <Separator />
        {itemCount > 0 ? (
          <>
            <ScrollArea className="flex-grow px-4">
              <div className="flex flex-col gap-4 py-4">
                {cart.map((item) => (
                  <div key={item.cartItemId} className="flex items-center space-x-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded">
                      <Image
                        src={item.image || "/img/placeholder.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 text-sm">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-muted-foreground">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-5 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={item.quantity >= MAX_ITEM_QUANTITY}
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.cartItemId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="px-4 py-4">
              <div className="w-full space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <SheetTrigger asChild>
                  <Button asChild className="w-full">
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                </SheetTrigger>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-xl font-semibold">Your cart is empty</h3>
            <SheetTrigger asChild>
                <Button asChild>
                    <Link href="/shop">Start Shopping</Link>
                </Button>
            </SheetTrigger>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}