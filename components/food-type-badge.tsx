"use client"

import { Badge } from "@/components/ui/badge"
import { Leaf, Egg, Milk, Drumstick, Fish } from "lucide-react"
import { cn } from "@/lib/utils"

const META = [
  { bit: 1, label: "Veg", icon: Leaf, className: "bg-green-100 text-green-700 border-green-200" },
  { bit: 2, label: "Egg", icon: Egg, className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { bit: 4, label: "Dairy", icon: Milk, className: "bg-blue-100 text-blue-700 border-blue-200" },
  { bit: 8, label: "Meat", icon: Drumstick, className: "bg-red-100 text-red-700 border-red-200" },
  { bit: 16, label: "Seafood", icon: Fish, className: "bg-teal-100 text-teal-700 border-teal-200" },
] as const

export function FoodTypeBadge({ type }: { type: number }) {
  const activeMetas = META.filter((meta) => (type & meta.bit) === meta.bit)
  const badges = activeMetas.length > 0 ? activeMetas : [META[0]]

  return (
    <div className="flex flex-wrap gap-1 justify-end">
      {badges.map((meta) => {
        const Icon = meta.icon
        return (
          <Badge
            key={meta.bit}
            className={cn("flex items-center gap-1 border px-2 py-0.5 text-xs font-medium", meta.className)}
          >
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
          </Badge>
        )
      })}
    </div>
  )
}