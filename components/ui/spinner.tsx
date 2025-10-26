// components/ui/spinner.tsx
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  color?: "orange" | "white" | "gray"
}

export function Spinner({ size = "md", className, color = "orange" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  }

  const colorClasses = {
    orange: "text-orange-500",
    white: "text-white",
    gray: "text-gray-500"
  }

  return (
    <Loader2 className={cn(
      sizeClasses[size],
      "animate-spin",
      colorClasses[color],
      className
    )} />
  )
}

// Legacy component for backward compatibility
export function LegacySpinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary"></div>
    </div>
  )
}