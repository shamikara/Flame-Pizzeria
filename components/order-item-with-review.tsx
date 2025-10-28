"use client"

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReviewForm } from './review-form'
import { format } from 'date-fns'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
}

interface FoodItem {
  id: string
  name: string
  price: number
  imageUrl?: string | null
}

interface OrderItemWithReviewProps {
  item: {
    id: string
    quantity: number
    foodItem: FoodItem
    customizations: Array<{ name: string; price: number }>
    review?: Review | null
  }
  orderStatus: string
  orderId: string
  onReviewSubmit?: () => void
}

export function OrderItemWithReview({ 
  item, 
  orderStatus, 
  orderId, 
  onReviewSubmit 
}: OrderItemWithReviewProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasReview = !!item.review
  const canReview = orderStatus === 'DELIVERED' && !hasReview
  
  const handleReviewSubmit = async () => {
    setIsSubmitting(true)
    try {
      if (onReviewSubmit) {
        await onReviewSubmit()
      }
      setShowReviewForm(false)
    } catch (error) {
      console.error('Error submitting review:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  const currency = new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  });

  const linePrice = item.foodItem.price + 
    item.customizations.reduce((sum, custom) => sum + (custom?.price ?? 0), 0)
  const subtotal = linePrice * item.quantity

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-base font-semibold">
                {item.quantity} × {item.foodItem.name}
              </p>
              {item.customizations.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {item.customizations.map((custom, index) => (
                    <li key={index}>
                      • {custom.name} (+{currency.format(Number(custom?.price) || 0)})
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="text-right text-sm">
              <p className="font-medium">{currency.format(linePrice)}</p>
              <p className="text-muted-foreground">
                Subtotal: {currency.format(subtotal)}
              </p>
            </div>
          </div>

          {hasReview && item.review && (
            <div className="mt-3 pt-3 border-t border-gray-800">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < (item.review?.rating || 0)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                {item.review?.createdAt && (
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(item.review.createdAt), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
              {item.review?.comment && (
                <p className="mt-2 text-sm text-gray-300">
                  {item.review.comment}
                </p>
              )}
            </div>
          )}

          {canReview && !showReviewForm && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setShowReviewForm(true)}
            >
              Write a Review
            </Button>
          )}

          {showReviewForm && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
              <h4 className="text-sm font-medium mb-3">Write a Review</h4>
              <ReviewForm
                foodItemId={item.foodItem.id}
                onSuccess={handleReviewSubmit}
                onCancel={() => setShowReviewForm(false)}
                isSubmitting={isSubmitting}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
