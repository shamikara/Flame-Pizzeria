"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useCart } from "@/components/cart-provider"
import { MinusCircle, PlusCircle } from "lucide-react"

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
  customizations: Customization[]
}

export function FoodItemDetail({ item }: { item: FoodItem }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedCustomizations, setSelectedCustomizations] = useState<Customization[]>([])
  const { addToCart } = useCart()

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

  const handleAddToCart = () => {
    addToCart(
      {
        productId: item.id.toString(), // <-- cast to string
        name: item.name,
        price: item.price,
        image: item.image,
        customizations: selectedCustomizations.map(c => ({ ...c, id: Number(c.id) })),
      },
      quantity
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="relative aspect-square rounded-xl overflow-hidden">
        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" priority />
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
        <p className="text-2xl font-bold mb-4">Rs. {item.price.toFixed(2)}</p>
        <p className="text-muted-foreground mb-6">{item.longDescription || item.description}</p>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Quantity</h3>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
              <MinusCircle className="h-4 w-4" />
            </Button>
            <span className="text-xl font-medium w-8 text-center">{quantity}</span>
            <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)}>
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

          <Button size="default" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}
