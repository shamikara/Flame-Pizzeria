"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
<DayPicker
  showOutsideDays={showOutsideDays}
  className={cn("p-auto", className)} // more padding around calendar
  classNames={{
    months: "flex flex-col sm:flex-row sm:space-x-12 space-y-12 sm:space-y-0",
    month: "space-y-10 px-4",
    caption: "flex justify-center pt-3 relative items-center",
    caption_label: "text-lg font-semibold tracking-wide",
    nav: "space-x-3 flex items-center",
    nav_button: cn(
      buttonVariants({ variant: "outline" }),
      "h-12 w-12 bg-transparent p-0 opacity-80 hover:opacity-100 transition"
    ),
    nav_button_previous: "absolute left-3",
    nav_button_next: "absolute right-3",
    table: "w-full border-collapse space-y-4", // more vertical breathing space
    head_row: "flex justify-between mb-5", // extra gap between weekday names and days
    head_cell:
      "text-muted-foreground uppercase tracking-wide rounded-md w-14 font-semibold text-[1rem] text-center",
    row: "flex w-full justify-between",
    cell: cn(
      "h-16 w-16 text-center text-xl p-0 relative",
      "[&:has([aria-selected].day-range-end)]:rounded-r-lg",
      "[&:has([aria-selected].day-outside)]:bg-accent/40",
      "[&:has([aria-selected])]:bg-accent",
      "first:[&:has([aria-selected])]:rounded-l-lg",
      "last:[&:has([aria-selected])]:rounded-r-lg",
      "focus-within:relative focus-within:z-20"
    ),
    day: cn(
      buttonVariants({ variant: "ghost" }),
      "h-14 w-14 p-0 font-semibold text-lg aria-selected:opacity-100"
    ),
    day_range_end: "day-range-end",
    day_selected:
      "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary focus:text-primary-foreground",
    day_today:
      "border-2 border-primary text-primary font-bold bg-accent/30",
    day_outside:
      "day-outside text-muted-foreground aria-selected:bg-accent/40 aria-selected:text-muted-foreground",
    day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
    day_range_middle:
      "aria-selected:bg-accent aria-selected:text-accent-foreground",
    day_hidden: "invisible",
    ...classNames,
  }}
  components={{
    IconLeft: (props) => <ChevronLeft {...props} className="h-6 w-6" />,
    IconRight: (props) => <ChevronRight {...props} className="h-6 w-6" />,
  }}
  {...props}
/>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
