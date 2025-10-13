"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

type Category = {
  id: number;
  name: string;
}

export function FoodCategoryTabs({ activeCategory }: { activeCategory: string }) {
  const pathname = usePathname()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Failed to load categories:', err))
  }, [])

  const allCategories = [
    { id: 0, name: "All Items", slug: "all" },
    ...categories.map(cat => ({ 
      id: cat.id, 
      name: cat.name,
      slug: cat.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')
    }))
  ]

  return (
    <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-hide">
      <div className="flex space-x-2">
        {allCategories.map((category) => (
          <Link
            key={category.id}
            href={`${pathname}?category=${category.slug}`}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              activeCategory === category.slug ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80",
            )}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  )
}