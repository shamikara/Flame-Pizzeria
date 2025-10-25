import { Suspense } from "react"
import { FoodCategoryTabs } from "@/components/food-category-tabs"
import { FoodItemGrid } from "@/components/food-item-grid"
import { prisma } from "@/lib/db"
import { FoodItem } from "@/components/food-item-detail"
import { Spinner } from "@/components/ui/spinner"
import { FoodSortSelect, SortOption } from "@/components/food-sort-select"

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: SortOption; q?: string }>
}) {
  const params = await searchParams
  const category = params?.category || "all"
  const sort = params?.sort || "recommended"
  const search = params?.q?.trim() ?? ""

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Our Menu</h1>
        <FoodSortSelect currentSort={sort} />
      </div>

      <FoodCategoryTabs activeCategory={category} />

      <Suspense fallback={<LoadingSkeleton />}>
        <FoodItems category={category} sort={sort} search={search} />
      </Suspense>
    </div>
  )
}

async function FoodItems({ category, sort, search }: { category: string; sort: SortOption; search: string }) {
  const items = await getFoodItems(category, sort, search)
  return <FoodItemGrid items={items} />
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Spinner />
      <p className="text-lg text-muted-foreground">Loading delicious items...</p>
    </div>
  )
}

async function getFoodItems(categorySlug: string, sort: SortOption, search: string): Promise<FoodItem[]> {
  const categoryName =
    categorySlug === "all"
      ? null
      : categorySlug
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
          .replace(/And/g, "&")

  const where: any = categoryName
    ? {
        category: {
          name: categoryName,
        },
      }
    : { isActive: true }

  if (search && !categoryName) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ]
  }

  const dbItems = await prisma.fooditem.findMany({
    where,
    include: {
      customizations: true,
      category: true,
      ratings: { select: { stars: true } },
      _count: { select: { ratings: true } },
    },
  })

  const mapped = dbItems.map((item: {
    id: any;
    name: any;
    description: any;
    price: any;
    imageUrl: any;
    category: { name: any };
    foodType: any;
    nutrition: any;
    customizations: any[];
    ratings?: { stars: number }[];
    _count?: { ratings?: number };
  }) => {
    const ratingCount = item._count?.ratings ?? item.ratings?.length ?? 0
    const ratingAverage = ratingCount
      ? item.ratings!.reduce((sum, rating) => sum + rating.stars, 0) / ratingCount
      : 5

    return {
      id: Number(item.id),
      name: item.name,
      description: item.description || "",
      longDescription: item.description || "",
      price: item.price,
      image: item.imageUrl || "/placeholder.svg",
      category: item.category?.name || "unknown",
      foodType: item.foodType ?? 0,
      nutrition: item.nutrition ?? null,
      customizations:
        item.customizations?.map((c) => ({
          id: Number(c.id),
          name: c.name,
          price: c.price,
        })) || [],
      ratingAverage,
      ratingCount,
    }
  })

  const sorters: Record<SortOption, (a: FoodItem, b: FoodItem) => number> = {
    recommended: (a, b) => a.id - b.id,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    diet: (a, b) => (a.foodType || 0) - (b.foodType || 0) || a.name.localeCompare(b.name),
  }

  return mapped.sort(sorters[sort])
}