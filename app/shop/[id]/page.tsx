import { notFound } from "next/navigation"
import { FoodItemDetail, type FoodItem } from "@/components/food-item-detail"
import { prisma } from "@/lib/db"

export default async function FoodItemPage({ params }: { params: { id: string } }) {
  const item = await getFoodItemById(params.id)

  if (!item) notFound()

  return (
    <div className="container mx-auto px-4 py-8">
      <FoodItemDetail item={item} />
    </div>
  )
}

async function getFoodItemById(id: string): Promise<FoodItem | null> {
  const dbItem = await prisma.foodItem.findUnique({
    where: { id: parseInt(id) },  
    include: { customizations: true, category: true },
  })

  if (!dbItem) return null

  return {
    id: Number(dbItem.id),
    name: dbItem.name,
    description: dbItem.description || "",
    longDescription: dbItem.description || "",
    price: dbItem.price,
    image: dbItem.imageUrl || "/placeholder.svg",
    category: dbItem.category?.name || "unknown",
    customizations: dbItem.customizations?.map((c: { id: any; name: any; price: any }) => ({
      id: Number(c.id),
      name: c.name,
      price: c.price,
    })) || [], // always array
  }
}
