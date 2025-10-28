"use client"

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReviewForm } from './review-form'
import { format } from 'date-fns'

interface OrderItemWithReviewProps {
  item: {
    id: string
    quantity: number
    foodItem: {
      id: string
      name: string
      price: number
      imageUrl?: string | null
    }
    customizations: Array<{ name: string; price: number }>
    review?: {
      id: string
      rating: number
      comment: string | null
      createdAt: string
    } | null
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
  const [showReviews, setShowReviews] = useState(false)

  const hasReview = !!item.review
  const canReview = orderStatus === 'DELIVERED' && !hasReview
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

          {hasReview && (
            <div className="mt-3 pt-3 border-t border-gray-800">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < item.review!.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(item.review!.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
              {item.review?.comment && (
                <p className="mt-2 text-sm text-gray-300">
                  "{item.review.comment}"
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
            <div className="mt-4 pt-3 border-t border-gray-800">
              <ReviewForm
                orderId={orderId}
                foodItemId={item.foodItem.id}
                foodItemName={item.foodItem.name}
                onSuccess={() => {
                  setShowReviewForm(false)
                  onReviewSubmit?.()
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
