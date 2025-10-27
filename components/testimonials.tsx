"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Review {
  id: number
  name: string
  rating: number
  text: string
  date: string
  userImage?: string | null
}

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Fetch reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews')
        if (!response.ok) {
          throw new Error('Failed to fetch reviews')
        }
        const data = await response.json()
        setReviews(data)
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setError('Failed to load reviews. Please try again later.')
        // Fallback to default testimonials if API fails
        setReviews(getDefaultTestimonials())
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [])

  // Auto-rotate testimonials
  useEffect(() => {
    if (reviews.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [reviews.length])

  // Fallback to default testimonials if no reviews
  const displayReviews = reviews.length > 0 ? reviews : getDefaultTestimonials()
  const currentReview = displayReviews[currentIndex]

  if (isLoading) {
    return (
      <section className="py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">
          What Our Customers Say
        </h2>
        <div className="container mx-auto px-4">
          <Skeleton className="h-48 w-full max-w-2xl mx-auto rounded-lg" />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">
          What Our Customers Say
        </h2>
        <div className="container mx-auto px-4 text-center text-red-500">
          {error}
        </div>
      </section>
    )
  }

  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        What Our Customers Say
      </h2>
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-8 md:p-12">
            {displayReviews.length > 0 ? (
              <div className="text-center">
                <div className="mb-6">
                  <div className="flex justify-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 mx-1 ${
                          star <= currentReview.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <blockquote className="text-xl md:text-2xl font-medium text-gray-700 dark:text-gray-200 mb-6">
                    "{currentReview.text}"
                  </blockquote>
                  
                  <div className="flex items-center justify-center space-x-4">
                    {currentReview.userImage ? (
                      <img 
                        src={currentReview.userImage} 
                        alt={currentReview.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                          {currentReview.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {currentReview.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {currentReview.date}
                      </p>
                    </div>
                  </div>
                </div>
                
                {displayReviews.length > 1 && (
                  <div className="flex justify-center space-x-2 mt-6">
                    {displayReviews.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-2 w-2 rounded-full transition-all ${
                          idx === currentIndex 
                            ? 'bg-yellow-500 w-6' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                        aria-label={`Go to testimonial ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No reviews yet. Be the first to leave a review!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// Fallback testimonials in case API fails
function getDefaultTestimonials(): Review[] {
  return [
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
      text: "First time trying the egg buns—now I'm addicted! Tastes just like the ones from Galle Road bakeries.",
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
}
