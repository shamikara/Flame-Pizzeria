"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Nadeesha Perera",
    rating: 5,
    text: "The fish buns are incredibly flavorful and fresh! Reminds me of the ones from my childhood in Negombo.",
    date: "February 12, 2024",
  },
  {
    id: 2,
    name: "Ruwan Jayasinghe",
    rating: 4,
    text: "Absolutely love the kimbula buns here. Crispy outside, soft and sweet inside. Perfect with evening tea!",
    date: "March 9, 2024",
  },
  {
    id: 3,
    name: "Dilani Fernando",
    rating: 5,
    text: "The seeni sambol rolls are divine! The balance of sweet and spicy is just perfect.",
    date: "April 3, 2024",
  },
  {
    id: 4,
    name: "Manoj de Silva",
    rating: 4,
    text: "Delicious short eats! Great for parties. Their delivery was super fast and well-packed.",
    date: "April 27, 2024",
  },
  {
    id: 5,
    name: "Thushari Wijeratne",
    rating: 5,
    text: "Their butter cake is heavenly. Just the right amount of sweetness and buttery goodness.",
    date: "May 1, 2024",
  },
  {
    id: 6,
    name: "Suresh Samarasinghe",
    rating: 5,
    text: "First time trying the egg buns—now I’m addicted! Tastes just like the ones from Galle Road bakeries.",
    date: "May 10, 2024",
  },
  {
    id: 7,
    name: "Nilushi Gunawardana",
    rating: 4,
    text: "Loved the variety in their submarine sandwiches. The spicy chicken sub is my favourite.",
    date: "May 18, 2024",
  },
  {
    id: 8,
    name: "Isuru Ranathunga",
    rating: 5,
    text: "Amazing selection of traditional pastries. The staff is friendly and packaging is on point.",
    date: "May 23, 2024",
  }
]

export function Testimonials() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const t = testimonials[index]

  return (
    <section className="py-5">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        What Our Customers Say
      </h2>
      <div className="container mt-10 p-8 my-8 rounded-xl backdrop-blur-md bg-white/70 dark:bg-black/50 shadow-sm dark:shadow-none">
        <div className="max-w-xl mx-auto text-center px-4 transition-opacity duration-500">
          <p className="text-lg font-medium italic text-gray-700 dark:text-gray-200">"{t.text}"</p>
          <div className="my-4 flex justify-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 mx-0.5 ${
                  i < t.rating
                    ? "fill-yellow-500 text-yellow-500"
                    : "fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600"
                }`}
              />
            ))}
          </div>
          <div className="mt-4 font-semibold text-lg text-gray-800 dark:text-gray-300">{t.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-500/80">{t.date}</div>
        </div>
      </div>
    </section>
  )
}
