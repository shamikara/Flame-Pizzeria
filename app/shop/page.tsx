import { FoodCategoryTabs } from "@/components/food-category-tabs"
import { FoodItemGrid } from "@/components/food-item-grid"
import { Suspense } from "react"
import { FoodItemSkeleton } from "@/components/food-item-skeleton"

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const category = await searchParams.category || "all"

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Menu</h1>

      <FoodCategoryTabs activeCategory={category} />

      <Suspense fallback={<FoodItemSkeleton count={8} />}>
        <FoodItems category={category} />
      </Suspense>
    </div>
  )
}

async function FoodItems({ category }: { category: string }) {
  // Fetch food items from database based on category
  const items = await getFoodItems(category)

  return <FoodItemGrid items={items} />
}

async function getFoodItems(category: string) {
  // In a real app, this would fetch from database with filtering
  const allItems = [
    // Pizzas
    {
      id: 1,
      name: "Margherita Pizza",
      description: "Classic tomato sauce, fresh mozzarella, basil",
      price: 1399.00,
      image: "img/fooditems/1.png?height=300&width=300",
      category: "pizza",
      customizations: [
        { id: 1, name: "Extra Cheese", price: 150.00 },
        { id: 2, name: "Mushrooms", price: 100.00 },
        { id: 3, name: "Extra Pepperoni", price: 150.00 },
        { id: 4, name: "Extra Onions", price: 75.00 },
        { id: 5, name: "Extra Bell Peppers", price: 75.00 },
      ],
    },
    {
      id: 2,
      name: "Black Chicken Pizza",
      description: "BBQ sauce, fresh mozzarella, basil and black chicken curry topping",
      price: 1699.00,
      image: "img/fooditems/2.png?height=300&width=300",
      category: "pizza",
      customizations: [
        { id: 1, name: "Extra Cheese", price: 150.00 },
        { id: 2, name: "Mushrooms", price: 100.00 },
        { id: 3, name: "Extra Pepperoni", price: 150.00 },
        { id: 4, name: "Extra Onions", price: 75.00 },
        { id: 5, name: "Extra Bell Peppers", price: 75.00 },
      ],
    },

    {
      id: 3,
      name: "Pepperoni Pizza",
      description: "Classic pepperoni pizza with extra cheese",
      price: 1499.00,
      image: "img/fooditems/3.png?height=300&width=300",
      category: "pizza",
      customizations: [
        { id: 1, name: "Extra Cheese", price: 150.00 },
        { id: 2, name: "Mushrooms", price: 100.00 },
        { id: 3, name: "Extra Pepperoni", price: 150.00 },
        { id: 4, name: "Extra Onions", price: 75.00 },
        { id: 5, name: "Extra Bell Peppers", price: 75.00 },
      ],
    },
    {
      id: 4,
      name: "Spicy Lankan Chicken Pizza",
      description: "Tandoori chicken, onions, green chili, mozzarella",
      price: 1450,
      image: "img/fooditems/4.png?height=300&width=300",
      category: "pizza",
      customizations: [
        { id: 1, name: "Extra Cheese", price: 150 },
        { id: 2, name: "Extra Green Chilies", price: 100 },
        { id: 3, name: "Extra Onion Rings", price: 75 },
        { id: 4, name: "Extra chicken", price: 200 },
        { id: 5, name: "Extra Bell Peppers", price: 75.00 },
      ],
    },
    {
      id: 5,
      name: "Veg Kurakkan Pizza",
      description: "Healthy Kurakkan base with local veggies and herbs",
      price: 1350,
      image: "img/fooditems/5.png?height=300&width=300",
      category: "pizza",
      customizations: [
        { id: 4, name: "Mushrooms", price: 100 },
        { id: 5, name: "Extra Paneer", price: 150 },
        { id: 6, name: "Extra Cheese", price: 150 },
        { id: 3, name: "Extra Onion Rings", price: 75 },
        { id: 5, name: "Extra Bell Peppers", price: 75.00 },
      ],
    },
    {
      id: 6,
      name: "Seafood Delight Pizza",
      description: "Prawns, cuttlefish, and spicy seafood sauce",
      price: 1650,
      image: "img/fooditems/6.png?height=300&width=300",
      category: "pizza",
      customizations: [
        { id: 6, name: "Extra Prawns", price: 200 },
        { id: 7, name: "Spicy Mayo Drizzle", price: 50 },
        { id: 8, name: "Extra Cheese", price: 150 },
        { id: 9, name: "Extra Bell Peppers", price: 75.00 },
        { id: 10, name: "Extra Cuttlefish", price: 150.00 },
        { id: 11, name: "Extra Tomatoes", price: 50 },
      ],
    },
    {
      id: 7,
      name: "Classic Cheeseburger",
      description: "Beef patty, cheese, lettuce, tomato, special sauce",
      price: 1099.00,
      image: "img/fooditems/7.png?height=300&width=300",
      category: "burgers-and-submarines",
      customizations: [
        { id: 6, name: "Double Patty", price: 300.00 },
        { id: 7, name: "Bacon", price: 150.00 },
        { id: 8, name: "Avocado", price: 200.00 },
        { id: 9, name: "Extra Cheese", price: 100.00 },
        { id: 10, name: "Fried Egg", price: 150.00 },
        { id: 11, name: "Extra Lettuce", price: 100 },
        { id: 12, name: "Extra Tomatoes", price: 50 },
      ],
    },
    {
      id: 8,
      name: "BBQ Bacon Burger",
      description: "Beef patty, bacon, cheddar, BBQ sauce, onion rings",
      price: 1299.00,
      image: "img/fooditems/8.png?height=300&width=300",
      category: "burgers-and-submarines",
      customizations: [
        { id: 6, name: "Double Patty", price: 300.00 },
        { id: 7, name: "Extra Bacon", price: 150.00 },
        { id: 9, name: "Extra Cheese", price: 100.00 },
        { id: 11, name: "Extra Jalapeños", price: 75.00 },
        { id: 12, name: "Mushrooms", price: 100.00 },
        { id: 13, name: "Extra Onion Rings", price: 50 },
      ],
    },
    {
      id: 9,
      name: "Italian Sub",
      description: "Ham, salami, pepperoni, provolone, lettuce, tomato, Italian dressing",
      price: 1099.00,
      image: "img/fooditems/9.png?height=300&width=300",
      category: "burgers-and-submarines",
      customizations: [
        { id: 13, name: "Extra Meat", price: 250.00 },
        { id: 14, name: "Extra Cheese", price: 100.00 },
        { id: 15, name: "Avocado", price: 200.00 },
        { id: 16, name: "Jalapeños", price: 75.00 },
        { id: 17, name: "Banana Peppers", price: 100.00 },
      ],
    },
    {
      id: 10,
      name: "Turkey Club Sub",
      description: "Turkey, bacon, lettuce, tomato, mayo on a fresh baked roll",
      price: 1199.00,
      image: "img/fooditems/10.png?height=300&width=300",
      category: "burgers-and-submarines",
      customizations: [
        { id: 13, name: "Extra Turkey", price: 250.00 },
        { id: 14, name: "Extra Cheese", price: 100.00 },
        { id: 15, name: "Avocado", price: 200.00 },
        { id: 18, name: "Extra Bacon", price: 150.00 },
        { id: 19, name: "Ranch Dressing", price: 50.00 },
        { id: 20, name: "Extra Onion Rings", price: 50 },
      ],
    },
    
    {
      id: 11,
      name: "Kottu Submarine",
      description: "Chicken kottu in a submarine roll with melted cheese",
      price: 950,
      image: "img/fooditems/11.png?height=300&width=300",
      category: "burgers-and-submarines",
      customizations: [
        { id: 8, name: "Extra Kottu", price: 200 },
        { id: 9, name: "Fried Egg", price: 100 },
        { id: 10, name: "Extra Cheese", price: 150 },
        { id: 11, name: "Extra Tomato", price: 50 },
        
      ],
    },
    {
      id: 12,
      name: "Lankan Spicy Burger",
      description: "Beef patty, seeni sambol, cheese, and lunu miris",
      price: 999,
      image: "img/fooditems/12.png?height=300&width=300",
      category: "burgers-and-submarines",
      customizations: [
        { id: 10, name: "Double Patty", price: 300 },
        { id: 11, name: "Extra Cheese", price: 150 },
        { id: 18, name: "Extra Bacon", price: 150.00 },
        { id: 14, name: "Extra Cheese", price: 100.00 },
        { id: 15, name: "Extra Tomato", price: 50 },
        { id: 16, name: "Extra Spicy", price: 50 },

      ],
    },

    {
      id: 13,
      name: "Fish Bun",
      description: "Spicy Sri Lankan fish curry inside a fluffy bun",
      price: 80,
      image: "img/fooditems/13.png?height=300&width=300",
      category: "short-eats",
      customizations: [],
    },
    {
      id: 14,
      name: "Egg Roll",
      description: "Crispy roll stuffed with savory fish, fresh vegetables, and eggs",
      price: 130,
      image: "img/fooditems/14.png?height=300&width=300",
      category: "short-eats",
      customizations: [],
    },
    {
      id: 15,
      name: "Chicken Patty",
      description: "Golden crust filled with curried chicken and potato",
      price: 120,
      image: "img/fooditems/15.png?height=300&width=300",
      category: "short-eats",
      customizations: [],
    },
    {
      id: 16,
      name: "Vegetable Roti",
      description: "Flatbread filled with spiced fresh vegetables",
      price: 100,
      image: "img/fooditems/16.png?height=300&width=300",
      category: "short-eats",
      customizations: [],
    },
    {
      id: 17,
      name: "Jam Bun",
      description: "Fluffy bun oozing with rich jam and a touch of cheese cream",
      price: 180.00,
      image: "img/fooditems/17.png?height=300&width=300",
      category: "short-eats",
      customizations: [],
    },
    {
      id: 18,
      name: "Sausage Roll",
      description: "Puff pastry with local grilled sausage filling",
      price: 150,
      image: "img/fooditems/18.png?height=300&width=300",
      category: "short-eats",
      customizations: [],
    },

    {
      id: 19,
      name: "Faluda",
      description: "Rose milk with ice cream, basil seeds, jelly & syrup",
      price: 450,
      image: "img/fooditems/19.png?height=300&width=300",
      category: "drinks-and-deserts",
      customizations: [],
    },
    {
      id: 20,
      name: "Watalappan",
      description: "Traditional jaggery pudding with coconut and eggs",
      price: 300,
      image: "img/fooditems/20.png?height=300&width=300",
      category: "drinks-and-deserts",
      customizations: [],
    },
    {
      id: 21,
      name: "Fruit Salad",
      description: "Fresh fruits with honey and mint, served with cheesy ice cream.",
      price: 450,
      image: "img/fooditems/21.png?height=300&width=300",
      category: "drinks-and-deserts",
      customizations: [],
    },
    {
      id: 22,
      name: "Iced Milo",
      description: "Chilled Milo with ice and sweetened milk",
      price: 250,
      image: "img/fooditems/22.png?height=300&width=300",
      category: "drinks-and-deserts",
      customizations: [],
    },
    {
      id: 23,
      name: "Woodapple Juice",
      description: "Cool and tangy woodapple drink made fresh",
      price: 220,
      image: "img/fooditems/23.png?height=300&width=300",
      category: "drinks-and-deserts",
      customizations: [],
    },
  ];

  // Filter by category if not "all"
  if (category !== "all") {
    return allItems.filter((item) => item.category === category)
  }

  return allItems
}
