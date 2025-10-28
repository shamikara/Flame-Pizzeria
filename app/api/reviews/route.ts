import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

type ReviewWithUserAndFoodItem = Prisma.ratingGetPayload<{
  include: {
    user: { select: { firstName: true; lastName: true } };
    foodItem: { select: { name: true } };
  };
}>;

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId, foodItemId, rating, comment } = await request.json();

    // Validate input
    if (!orderId || !foodItemId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid input. Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId, userId: session.userId },
      include: { items: true }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or access denied' },
        { status: 404 }
      );
    }

    // Check if order is delivered
    if (order.status !== 'DELIVERED') {
      return NextResponse.json(
        { error: 'Can only review delivered orders' },
        { status: 400 }
      );
    }

    // Check if item exists in order
    const orderItem = order.items.find(item => item.foodItemId === foodItemId);
    if (!orderItem) {
      return NextResponse.json(
        { error: 'Food item not found in this order' },
        { status: 400 }
      );
    }

    // Check if already reviewed
    const existingReview = await prisma.rating.findFirst({
      where: {
        userId: session.userId,
        foodItemId: foodItemId,
        order: {
          id: orderId
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        foodItem: {
          select: {
            name: true
          }
        }
      }
    });

    let review;
    if (existingReview) {
// Update existing review
      review = await prisma.rating.update({
        where: { id: existingReview.id },
        data: {
          stars: rating,
          comment: comment || null,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          foodItem: {
            select: {
              name: true
            }
          }
        }
      });
    } else {
// Create new review
      review = await prisma.rating.create({
        data: {
          stars: rating,
          comment: comment || null,
          userId: session.userId,
          foodItemId: foodItemId,
          orderId: orderId,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          foodItem: {
            select: {
              name: true
            }
          }
        }
      });

// Update order's isReviewed status if all items are reviewed
      const totalItems = order.items.length;
      const reviewedItems = await prisma.rating.count({
        where: { 
          order: {
            id: orderId
          }
        }
      });

      if (reviewedItems >= totalItems) {
        await prisma.order.update({
          where: { id: orderId },
          data: {}
        });
      }
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
// Get reviews with user and food item details
    const reviews = await prisma.rating.findMany({
      where: {},
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        foodItem: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

// Format response
    const formattedReviews = reviews.map((review) => {
      const userName = review.user ? 
        `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() : 
        'Anonymous';
      
      return {
        id: review.id,
        name: userName,
        rating: review.stars,
        text: review.comment || '',
        date: new Date(review.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        userImage: null
      };
    });

    return NextResponse.json(formattedReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
