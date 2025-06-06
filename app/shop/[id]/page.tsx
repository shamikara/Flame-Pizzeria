import { FoodItemDetail } from "@/components/food-item-detail"
import { notFound } from "next/navigation"

export default async function FoodItemPage({ params }: { params: { id: string } }) {
  const item = await getFoodItemById(Number.parseInt(params.id))

  if (!item) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FoodItemDetail item={item} />
    </div>
  )
}

async function getFoodItemById(id: number) {
  // In a real app, this would fetch from your database
  const allItems = [
    // Pizzas
    {
      id: 1,
      name: "Margherita Pizza",
      description: "Classic tomato sauce, fresh mozzarella, basil",
      longDescription:
        "Our Margherita Pizza is made with San Marzano tomato sauce, fresh mozzarella cheese, fresh basil, salt, and extra-virgin olive oil. Baked to perfection in our brick oven for that authentic Italian taste.",
      price: 13.99,
      image: "/placeholder.svg?height=600&width=600",
      category: "pizza",
      customizations: [
        { id: 1, name: "Extra Cheese", price: 1.5 },
        { id: 2, name: "Extra Mushrooms", price: 1.0 },
        { id: 3, name: "Extra Pepperoni", price: 1.5 },
        { id: 4, name: "Extra Onions", price: 0.75 },
        { id: 5, name: "Extra Bell Peppers", price: 0.75 },
      ],
    },
    // More items would be here...
  ]

  return allItems.find((item) => item.id === id)
}
