"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useCart } from "@/components/cart-provider"
import { MinusCircle, PlusCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { getImagePath } from "@/lib/image-utils"
import { FoodTypeBadge } from "@/components/food-type-badge"

type Customization = {
  id: number
  name: string
  price: number
}

export type FoodItem = {
  id: number
  name: string
  description: string
  longDescription?: string
  price: number
  image: string
  category: string
  foodType: number
  customizations: Customization[]
}

export function FoodItemDetail({ item }: { item: FoodItem }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedCustomizations, setSelectedCustomizations] = useState<Customization[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const { addToCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1) setQuantity(newQuantity)
  }

  const toggleCustomization = (customization: Customization) => {
    setSelectedCustomizations((prev) => {
      const exists = prev.find((c) => c.id === customization.id)
      if (exists) return prev.filter((c) => c.id !== customization.id)
      return [...prev, customization]
    })
  }

  const calculateTotalPrice = () => {
    const basePrice = item.price * quantity
    const customizationsPrice = selectedCustomizations.reduce((sum, c) => sum + c.price, 0) * quantity
    return basePrice + customizationsPrice
  }

  const handleAddToCart = async () => {
    setIsAdding(true)

    await new Promise((resolve) => setTimeout(resolve, 300))

    addToCart(
      {
        productId: item.id.toString(),
        name: item.name,
        price: item.price,
        image: item.image,
        customizations: selectedCustomizations.map((c) => ({ ...c, id: Number(c.id) })),
      },
      quantity,
    )

    setIsAdding(false)

    toast({
      title: "Added to Cart!",
      description: `${quantity}x ${item.name} added to your cart.`,
      duration: 2000,
    })

    setTimeout(() => {
      router.push("/shop")
    }, 1500)
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="relative aspect-square rounded-xl overflow-hidden">
        <Image src={getImagePath(item.image)} alt={item.name} fill className="object-cover" priority />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{item.name}</h1>
          <FoodTypeBadge type={item.foodType ?? 0} />
        </div>

        <p className="text-2xl font-bold">Rs. {item.price.toFixed(2)}</p>
        <p className="text-muted-foreground">{item.longDescription || item.description}</p>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Quantity</h3>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1 || isAdding}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
            <span className="text-xl font-medium w-8 text-center">{quantity}</span>
            <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)} disabled={isAdding}>
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {item.customizations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Customizations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {item.customizations.map((customization) => (
                <div key={customization.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={`customization-${customization.id}`}
                    checked={selectedCustomizations.some((c) => c.id === customization.id)}
                    onCheckedChange={() => toggleCustomization(customization)}
                    disabled={isAdding}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor={`customization-${customization.id}`} className="text-sm font-medium">
                      {customization.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">+ Rs. {customization.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>Rs. {calculateTotalPrice().toFixed(2)}</span>
          </div>

          <Button size="lg" onClick={handleAddToCart} disabled={isAdding} className="w-full">
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding to Cart...
              </>
            ) : (
              "Add to Cart"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}