// components/ui/spinner.tsx
export function Spinner() {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    )
  }