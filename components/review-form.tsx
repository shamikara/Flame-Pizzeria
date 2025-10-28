"use client"

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'

interface ReviewFormProps {
  foodItemId: string
  onSuccess: () => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function ReviewForm({
  foodItemId,
  onSuccess,
  onCancel,
  isSubmitting = false
}: ReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
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

    try {
      const reviewData = {
        foodItemId: foodItemId, // Already a number from props
        stars: rating,
        comment: comment.trim() || null,
      }

      console.log('Submitting review:', reviewData)

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('Review submission failed:', data)
        throw new Error(data.error || 'Failed to submit review')
      }

      console.log('Review submitted successfully:', data)
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback!",
      })

      onSuccess()
    } catch (error) {
      console.error('Error submitting review:', error)
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again later.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      
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
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
