import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function CategoryShowcase() {
  const categories = [
    {
      id: "pizza",
      name: "Pizza",
      description: "Handcrafted pizzas with premium toppings",
      image: "img/ourcategories/pizza.jpg?height=400&width=600",
      link: "/shop?category=pizza",
    },
    {
      id: "burgers-and-submarines",
      name: "Burgers & Submarines",
      description: "Juicy burgers & submarines with fresh ingredients",
      image: "img/ourcategories/subnburg.jpg?height=400&width=600",
      link: "/shop?category=burgers-and-submarines",
    },
    {
      id: "short-eats",
      name: "Short Eats",
      description: "Sri Lankan snacks & savory bakery bites",
      image: "img/ourcategories/shorteats.jpg?height=400&width=600",
      link: "/shop?category=short-eats",
    },
    {
      id: "drinks-and-deserts",
      name: "Drinks & Deserts",
      description: "Island-style sweets & refreshing beverages",
      image: "img/ourcategories/desert.jpg?height=400&width=600",
      link: "/shop?category=drinks-and-deserts",
    },
  ]

  return (
    <section className="py-12 bg-muted/30">
      <div className="container px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Categories</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {categories.map((category) => (
            <div key={category.id} className="relative group overflow-hidden rounded-xl">
              <div className="aspect-[4/3] relative">
                <Image
                  src={category.image || "/img/placeholder.png"}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/0 flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-bold text-white mb-2 flame-text shadow-md">{category.name}</h3>
                  <p className="text-white/80 mb-4 shadow-md">{category.description}</p>
                  <Button asChild className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition">
                    <Link href={category.link}>Browse {category.name}</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
