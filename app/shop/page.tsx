import { Suspense } from "react"
import { FoodCategoryTabs } from "@/components/food-category-tabs"
import { FoodItemGrid } from "@/components/food-item-grid"
import { prisma } from "@/lib/db"
import { FoodItem } from "@/components/food-item-detail"
import { Spinner } from "@/components/ui/spinner"

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const category = searchParams?.category || "all"

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Menu</h1>

      <FoodCategoryTabs activeCategory={category} />

      <Suspense fallback={<Spinner />}>
        <FoodItems category={category} />
      </Suspense>
    </div>
  )
}

async function FoodItems({ category }: { category: string }) {
  const items = await getFoodItems(category)
  return <FoodItemGrid items={items} />
}

async function getFoodItems(category: string): Promise<FoodItem[]> {
  const dbItems = await prisma.foodItem.findMany({
    where: category !== "all" ? { category: { name: category } } : {},
    include: { customizations: true, category: true },
    orderBy: { id: "asc" },
  })

  return dbItems.map(item => ({
    id: Number(item.id),
    name: item.name,
    description: item.description || "",
    longDescription: item.description || "",
    price: item.price,
    image: item.imageUrl || "/placeholder.svg",
    category: item.category?.name || "unknown",
    customizations: item.customizations?.map(c => ({
      id: Number(c.id),
      name: c.name,
      price: c.price,
    })) || [],
  }))
}
