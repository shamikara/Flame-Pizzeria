"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function FoodCategoryTabs({ activeCategory }: { activeCategory: string }) {
  const pathname = usePathname()

  const categories = [
    { id: "all", name: "All Items" },
    { id: "pizza", name: "Pizza" },
    { id: "burgers-and-submarines", name: "Burgers & Submarines" },
    { id: "short-eats", name: "Short Eats" },
    { id: "drinks-and-deserts", name: "Drinks & Deserts" },
  ]

  return (
    <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-hide">
      <div className="flex space-x-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`${pathname}?category=${category.id}`}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              activeCategory === category.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80",
            )}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
