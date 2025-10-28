"use client"

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'

interface ReviewFormProps {
  orderId: string
  foodItemId: string
  foodItemName: string
  existingRating?: number
  existingComment?: string
  onSuccess?: () => void
}

export function ReviewForm({
  orderId,
  foodItemId,
  foodItemName,
  existingRating,
  existingComment,
  onSuccess
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingRating || 0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState(existingComment || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!rating) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting your review.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          foodItemId,
          rating,
          comment: comment.trim() || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback!",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">Review {foodItemName}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`p-1 ${star <= (hover || rating) ? 'text-yellow-500' : 'text-gray-300'}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              disabled={isSubmitting}
            >
              <Star className={`h-6 w-6 ${star <= (hover || rating) ? 'fill-current' : ''}`} />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-500">
            {rating} star{rating !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="Share your experience with this dish... (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </form>
    </div>
  )
}
