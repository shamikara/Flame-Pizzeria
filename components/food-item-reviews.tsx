"use client"

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface Review {
  id: number
  name: string
  rating: number
  text: string
  date: string
  userImage?: string | null
}

interface FoodItemReviewsProps {
  foodItemId: string
}

export function FoodItemReviews({ foodItemId }: FoodItemReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?foodItemId=${foodItemId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch reviews')
        }
        const data = await response.json()
        setReviews(data)
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setError('Failed to load reviews. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [foodItemId])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2 p-4 border rounded-lg">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-5 w-5 rounded-full mx-0.5" />
              ))}
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Customer Reviews</h3>
      
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6 last:border-b-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {review.userImage ? (
                  <img 
                    src={review.userImage} 
                    alt={review.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {review.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium">{review.name}</p>
                  <p className="text-sm text-gray-500">{review.date}</p>
                </div>
              </div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < review.rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {review.text && (
              <div className="mt-3 text-gray-700">
                <p>{review.text}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
