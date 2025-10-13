"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { FormEvent, useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

type Category = {
  id: number;
  name: string;
}

export function FoodCategoryTabs({ activeCategory }: { activeCategory: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const params = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [searchValue, setSearchValue] = useState("")
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const applySearch = (value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value.trim()) {
      next.set('q', value.trim())
    } else {
      next.delete('q')
    }
    router.push(`${pathname}?${next.toString()}`)
  }

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Failed to load categories:', err))
  }, [])

  useEffect(() => {
    setSearchValue(params.get('q') ?? '')
  }, [params])

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const buildCategoryHref = (slug: string) => {
    const next = new URLSearchParams(params.toString())
    next.set('category', slug)
    return `${pathname}?${next.toString()}`
  }

  const allCategories = [
    { id: 0, name: "All Items", slug: "all" },
    ...categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')
    }))
  ]

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    applySearch(searchValue)
  }

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      applySearch(value)
    }, 300)
  }

  const handleClear = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    setSearchValue('')
    applySearch('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between overflow-x-auto py-2 scrollbar-hide">
        <div className="flex space-x-2">
          {allCategories.map((category) => (
            <Link
              key={category.id}
              href={buildCategoryHref(category.slug)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                activeCategory === category.slug ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80",
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="w-96 h-10 pr-2 ">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search menu items..."
              className="pl-9 pr-9"
            />
            {searchValue && (
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full bg-gray-400/20 text-gray-200 cursor-pointer"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </div>
            )}
          </div>
        </form>
        </div>
      </div>
  )
}