"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

type FoodItem = {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
  customizations?: Array<{
    id: number
    name: string
    price: number
  }>
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
  const { addItem } = useCart()
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<number, boolean>>({})
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()
  const hasCustomizations = (item.customizations && item.customizations.length > 0)

  const handleCustomize = () => {
    if (!hasCustomizations) return
    setIsCustomizing(true)
    setSelectedCustomizations({})
  }

  const handleCustomizationToggle = (id: number) => {
    setSelectedCustomizations(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleAddToCart = () => {
    const selectedIds = Object.entries(selectedCustomizations)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => parseInt(id))

    const customizations = item.customizations?.filter(c => selectedIds.includes(c.id)) || []
    const totalPrice = item.price + customizations.reduce((sum, c) => sum + c.price, 0)

    addItem({
      id: item.id,
      name: item.name,
      price: totalPrice,
      image: item.image,
      quantity: 1,
      customizations: customizations,
    })
    setIsCustomizing(false)
    setShowModal(true)
  }

  const handleContinueShopping = () => {
    setShowModal(false)
  }

  const handleGoToCart = () => {
    setShowModal(false)
    router.push('/checkout')
  }

  return (
    <>
      <Card className="overflow-hidden">
        <Link href={`/shop/${item.id}`} className="block overflow-hidden">
          <div className="aspect-square relative">
            <Image
              src={item.image ? item.image : "img/placeholder.jpg"}
              alt={item.name}
              fill
              className="object-cover transition-transform hover:scale-105"
            />
          </div>
        </Link>
        <CardContent className="p-4">
          <Link href={`/shop/${item.id}`} className="block">
            <h3 className="font-bold text-lg mb-1 hover:text-primary transition-colors">{item.name}</h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
          <p className="font-bold">Rs. {item.price.toFixed(2)}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button
            variant="default"
            className="w-full"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
          <Button variant="outline" onClick={handleCustomize} className={`${hasCustomizations ? "border border-white/80 h-11" : "hidden"}`}>
            Customize
          </Button>
        </CardFooter>

        {isCustomizing && item.customizations && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 max-w-md w-full border border-white/80">
            <Image src={`/${item.image}`} className="mx-auto mb-6 rounded-md" alt={item.name} width={400} height={400} />
              <h2 className="text-xl font-light text-center text-gray-300 mb-8">Make Your {item.name} <br /> <span className="font-unifrakturcook !text-red-800 flame-text">Extra </span> Special ?</h2>
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
                    Rs. {(
                      item.price +
                      item.customizations
                        .filter(c => selectedCustomizations[c.id])
                        .reduce((sum, c) => sum + c.price, 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" className="border border-white/80" onClick={() => setIsCustomizing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddToCart}>
                  Add to Cart
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
              <Button onClick={handleContinueShopping} className="w-full">Continue Shopping</Button>
              <Button onClick={handleGoToCart} className="w-full bg-primary hover:bg-primary/90">Go to Checkout</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
