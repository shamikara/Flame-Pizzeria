import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getImagePath } from "@/lib/image-utils"

type FoodItem = {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
}

export function FeaturedItems({ items }: { items: FoodItem[] }) {
  return (
    <section className="py-12">
      <div className="container px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Items</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <Image src={getImagePath(item.image)} alt={item.name} fill className="object-cover" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold">Rs. {item.price.toFixed(2)}</span>
                  <Button asChild size="lg" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition">
                    <Link href={`/shop/${item.id}`}>View Item</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button asChild size="lg" className="bg-orange-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-800 transition">
            <Link href="/shop">View All Menu</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}