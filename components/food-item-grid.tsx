"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { Loader2, Utensils } from "lucide-react"
import { getImagePath } from "@/lib/image-utils"
import { FoodTypeBadge } from "@/components/food-type-badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Customization = {
  id: number
  name: string
  price: number
}

type FoodItem = {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
  foodType: number
  customizations?: Customization[]
  nutrition?: Record<string, number> | null
}

export function FoodItemGrid({ items }: { items: FoodItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <FoodItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}

function FoodItemCard({ item }: { item: FoodItem }) {
  const { addToCart } = useCart()
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<number, boolean>>({})
  const [showModal, setShowModal] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()
  const hasCustomizations = item.customizations && item.customizations.length > 0

  const handleCustomize = () => {
    if (!hasCustomizations) return
    setIsCustomizing(true)
    setSelectedCustomizations({})
  }

  const handleCustomizationToggle = (id: number) => {
    setSelectedCustomizations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleAddToCart = async (isCustomized: boolean = false) => {
    setIsAdding(true)

    await new Promise((resolve) => setTimeout(resolve, 300))

    const finalCustomizations =
      isCustomized && hasCustomizations
        ? item.customizations?.filter((c) => selectedCustomizations[c.id]).map((c) => ({ ...c, id: Number(c.id) })) || []
        : []

    addToCart(
      {
        productId: item.id.toString(),
        name: item.name,
        price: item.price,
        image: item.image,
        customizations: finalCustomizations,
      },
      1,
    )

    setIsCustomizing(false)
    setIsAdding(false)
    setShowModal(true)
  }

  const handleContinueShopping = () => setShowModal(false)
  const handleGoToCart = () => {
    setShowModal(false)
    router.push("/checkout")
  }

  return (
    <>
      <Card className="overflow-hidden">
        <Link href={`/shop/${item.id}`} className="block overflow-hidden">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="aspect-square relative group cursor-pointer">
                  <Image
                    src={getImagePath(item.image) || "img/placeholder.jpg"}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Utensils className="h-8 w-8 text-white" />
                  </div>
                </div>
              </TooltipTrigger>
              {item.nutrition && (
               <TooltipContent
  side="right"
  align="center"
  sideOffset={16}
  className="pointer-events-none max-w-xs rounded-xl bg-black/70 text-white border border-white/20 backdrop-blur-md shadow-2xl"
>
  <div className="space-y-3">
    <p className="text-sm font-semibold tracking-wide uppercase text-white/80">
      Nutrition Facts
    </p>
    <div className="space-y-2 text-sm">
      {Object.entries(item.nutrition).map(([key, value]) => {
        // Map each nutrient to its unit
        const units: Record<string, string> = {
          fat: "g",
          saturatedFat: "g",
          carbs: "g",
          fiber: "g",
          sugar: "g",
          sodium: "mg",
          protein: "g",
          calories: "kcal",
        };

        const unit = units[key] || ""; // fallback to empty if unknown
        return (
          <div
            key={key}
            className="flex justify-between gap-4 border-b border-white/10 pb-1 last:border-none last:pb-0"
          >
            <span className="capitalize text-white/70">{key}</span>
            <span className="font-semibold text-white">
              {value} {unit} {/* Show value with unit */}
            </span>
          </div>
        );
      })}
    </div>
    <p className="text-xs text-white/50 mt-2">
      *Values per serving
    </p>
  </div>
</TooltipContent>

              )}
            </Tooltip>
          </TooltipProvider>
        </Link>
        <CardContent className="p-4 space-y-3">
          <Link href={`/shop/${item.id}`} className="block">
            <h3 className="font-bold text-lg hover:text-primary transition-colors">{item.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <FoodTypeBadge type={item.foodType ?? 0} />
            </div>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          <p className="font-bold">Rs. {item.price.toFixed(2)}</p>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button
            variant="default"
            className="w-full"
            onClick={hasCustomizations ? handleCustomize : () => handleAddToCart(false)}
            disabled={isAdding}
          >
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : hasCustomizations ? (
              "Customize"
            ) : (
              "Add to Cart"
            )}
          </Button>
        </CardFooter>

        {isCustomizing && item.customizations && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 max-w-md w-full border border-white/80">
              <Image src={getImagePath(item.image)} className="mx-auto mb-6 rounded-md" alt={item.name} width={400} height={400} />
              <h2 className="text-xl font-light text-center text-gray-300 mb-8">
                Make Your {item.name} <br />
                <span className="font-unifrakturcook !text-red-800 flame-text">Extra </span> Special?
              </h2>
              <div className="mt-4 border-t pt-4"></div>
              <div className="space-y-4">
                {item.customizations.map((customization) => (
                  <div key={customization.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedCustomizations[customization.id] ?? false}
                        onChange={() => handleCustomizationToggle(customization.id)}
                        className="rounded border-gray-300 text-primary"
                        disabled={isAdding}
                      />
                      <span>{customization.name}</span>
                    </div>
                    <span className="font-bold">Rs. {customization.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total Price:</span>
                  <span className="font-bold text-primary">
                    Rs.{" "}
                    {(
                      item.price +
                      item.customizations
                        .filter((c) => selectedCustomizations[c.id])
                        .reduce((sum, c) => sum + c.price, 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" className="border border-white/80" onClick={() => setIsCustomizing(false)} disabled={isAdding}>
                  Cancel
                </Button>
                <Button onClick={() => handleAddToCart(true)} disabled={isAdding}>
                  {isAdding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add to Cart"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Item Added to Cart!</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p>Would you like to continue shopping or proceed to checkout?</p>
            <div className="flex gap-2">
              <Button onClick={handleContinueShopping} className="w-full">
                Continue Shopping
              </Button>
              <Button onClick={handleGoToCart} className="w-full bg-primary hover:bg-primary/90">
                Go to Checkout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}