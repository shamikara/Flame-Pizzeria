"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type SortOption = "recommended" | "price-asc" | "price-desc" | "diet"

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "diet", label: "Diet Type" },
]

export function FoodSortSelect({ currentSort }: { currentSort: SortOption }) {
  const router = useRouter()
  const params = useSearchParams()

  const handleChange = (value: SortOption) => {
    const newParams = new URLSearchParams(params.toString())
    newParams.set("sort", value)
    router.push(`/shop?${newParams.toString()}`)
  }

  return (
    <Select value={currentSort} onValueChange={handleChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Sort menu" />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}