// app/recipes/page.tsx
"use client"

import { useState } from "react"
import Image from "next/image"

const sampleRecipes = [
  {
    id: 1,
    title: "Pol Roti with Lunu Miris",
    author: "Suresh Fernando",
    date: "2024-12-12",
    image: "img/noticeboard/recipes/1.jpg",
    content:
      "Pol Roti made with scraped coconut and wheat flour, served hot with spicy lunu miris (onion-chili sambol). Perfect for breakfast or dinner.",
  },
  {
    id: 2,
    title: "Kottu Roti",
    author: "Ruwani Jayasena",
    date: "2024-11-05",
    image: "img/noticeboard/recipes/2.jpg",
    content:
      "Chopped godamba roti mixed with vegetables, egg, and spicy chicken curry. Stir-fried in classic Sri Lankan street style.",
  },
  {
    id: 3,
    title: "Watalappan",
    author: "Mohamed Rizwan",
    date: "2024-10-28",
    image: "img/noticeboard/recipes/3.jpg",
    content:
      "Rich and creamy coconut custard pudding made with jaggery, cardamom, and nutmeg — a festive dessert favorite.",
  },
  {
    id: 4,
    title: "Kiribath with Seeni Sambol",
    author: "Anoma Dias",
    date: "2024-09-20",
    image: "img/noticeboard/recipes/4.jpg",
    content:
      "Traditional milk rice cut into diamond shapes and served with caramelized onion sambol — a must for any celebration.",
  },
  {
    id: 5,
    title: "String Hoppers & Kiri Hodi with Coconut Sambol",
    author: "Nimal Perera",
    date: "2024-08-14",
    image: "img/noticeboard/recipes/5.jpg",
    content:
      "Delicate rice flour nests steamed and served with coconut milk gravy and spicy sambols. A classic Sri Lankan dinner dish.",
  },
  {
    id: 6,
    title: "Parippu Curry",
    author: "Yasodhara Gamage",
    date: "2024-07-01",
    image: "img/noticeboard/recipes/6.jpg",
    content:
      "Creamy red lentil curry cooked with coconut milk and tempered with mustard seeds, garlic, and curry leaves.",
  },
  {
    id: 7,
    title: "Fish Ambul Thiyal",
    author: "Priyantha Jayakody",
    date: "2024-06-10",
    image: "img/noticeboard/recipes/7.jpg",
    content:
      "Sour and spicy dry fish curry from southern Sri Lanka, made with goraka and pepper — intensely flavorful.",
  },
  {
    id: 8,
    title: "Pittu & Coconut Milk",
    author: "Manel Dissanayake",
    date: "2024-05-18",
    image: "img/noticeboard/recipes/8.jpg",
    content:
      "Steamed cylinders of rice flour and coconut, served with sweet coconut milk and spicy katta sambol.",
  },
]

export default function RecipesBoardPage() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Community Recipe Board</h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {sampleRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white/20 backdrop-blur-md rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:bg-white/30"
            onClick={() => setSelected(recipe.id)}
          >
            <Image
              src={recipe.image}
              alt={recipe.title}
              width={400}
              height={250}
              className="object-cover w-full h-48"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-1">{recipe.title}</h3>
              <p className="text-sm text-muted-foreground mb-1">✍️ by {recipe.author}</p>
              <p className="text-xs text-muted-foreground">{recipe.date}</p>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[url('/img/noticeboard/board.png')] bg-cover bg-no-repeat bg-center">
          <div className="bg-white/40 backdrop-blur-md rounded-lg shadow-xl max-w-4xl max-h-[80vh] h-full w-full p-4 relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
              onClick={() => setSelected(null)}
            >
              ❌
            </button>
            <Image
              src={sampleRecipes[selected - 1].image}
              alt={sampleRecipes[selected - 1].title}
              width={500}
              height={1000}
              className="rounded-md mb-4 object-cover w-full h-[400px]"
            />
            <h2 className="text-xl font-bold mb-2">{sampleRecipes[selected - 1].title}</h2>
            <p className="text-sm text-muted-foreground mb-2">
            ✍️ By {sampleRecipes[selected - 1].author} — {sampleRecipes[selected - 1].date}
            </p>
            <p className="text-base text-gray-800">{sampleRecipes[selected - 1].content}</p>
          </div>
          </div>
        </div>
      )}
    </div>
  )
}
