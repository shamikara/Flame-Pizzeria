"use client"

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ReviewForm } from './review-form'
import { Skeleton } from '@/components/ui/skeleton'

interface OrderItem {
  id: string
  quantity: number
  price: number
  foodItem: {
    id: string
    name: string
    price: number
  }
  review?: {
    id: string
    rating: number
    comment: string | null
  } | null
}

interface OrderDetailsProps {
  orderId: string
}

export function OrderDetails({ orderId }: OrderDetailsProps) {
  const [order, setOrder] = useState<{
    id: string
    status: string
    total: number
    createdAt: string
    items: OrderItem[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [showAllReviews, setShowAllReviews] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const loadOrder = async () => {
      await fetchOrder()
      setIsLoading(false)
    }

    loadOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch order details')
      }
      const data = await response.json()
      setOrder(data)
    } catch (err) {
      console.error('Error fetching order:', err)
      setError('Failed to load order details. Please try again later.')
    }
  }

  const handleReviewSuccess = (foodItemId: string) => {
    setExpandedItem(null)
    // Refetch order to show the new review
    fetchOrder()
  }

  const toggleReviews = (itemId: string) => {
    setShowAllReviews(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-32" />
        <div className="space-y-4 pt-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-24 mt-2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error || 'Order not found'}</p>
      </div>
    )
  }

  const statusVariant = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }[order.status] || 'bg-gray-100 text-gray-800'

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <p className="text-gray-500">
            Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="mt-2 md:mt-0">
          <Badge className={statusVariant}>
            {order.status.replace(/_/g, ' ')}
          </Badge>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
        
        <div className="divide-y">
          {order.items.map((item) => (
            <div key={item.id} className="py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{item.foodItem.name}</h3>
                  <p className="text-sm text-gray-500">
                    {item.quantity} × ${(item.price / 100).toFixed(2)}
                  </p>
                  {item.review && (
                    <div className="mt-2 flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-500">
                            {i < item.review!.rating ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                      {item.review.comment && (
                        <p className="ml-2 text-sm text-gray-600">
                          "{item.review.comment}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${((item.price * item.quantity) / 100).toFixed(2)}
                  </p>
                  {order.status === 'DELIVERED' && !item.review && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setExpandedItem(
                        expandedItem === item.id ? null : item.id
                      )}
                    >
                      {expandedItem === item.id ? 'Cancel' : 'Write a Review'}
                    </Button>
                  )}
                </div>
              </div>

              {expandedItem === item.id && (
                <div className="mt-4 pl-2 border-l-2 border-gray-200">
                  <ReviewForm
                    orderId={order.id}
                    foodItemId={item.foodItem.id}
                    foodItemName={item.foodItem.name}
                    onSuccess={() => handleReviewSuccess(item.foodItem.id)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>${(order.total / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
