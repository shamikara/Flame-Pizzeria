import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from '@/lib/session';

type ReviewWithUserAndFoodItem = {
  id: number;
  stars: number;
  comment: string | null;
  user: {
    firstName: string;
    lastName: string;
  };
  foodItem: {
    name: string;
  };
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { foodItemId, stars, comment } = await request.json();
    
    // Convert foodItemId to number if it's a string
    const foodItemIdNum = typeof foodItemId === 'string' ? parseInt(foodItemId, 10) : foodItemId;

    // Validate input
    if (!foodItemIdNum || isNaN(foodItemIdNum)) {
      return NextResponse.json(
        { error: 'Invalid food item ID' },
        { status: 400 }
      );
    }

    if (!stars || stars < 1 || stars > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5 stars' },
        { status: 400 }
      );
    }

    // Check if food item exists
    const foodItem = await prisma.fooditem.findUnique({
      where: { id: foodItemIdNum }
    });

    if (!foodItem) {
      return NextResponse.json(
        { error: 'Food item not found' },
        { status: 404 }
      );
    }

    // Check if user has already reviewed this food item
    const existingReview = await prisma.rating.findFirst({
      where: {
        userId: session.userId,
        foodItemId: foodItemIdNum,
      },
      select: {
        id: true,
        stars: true,
        comment: true,
        user: {
          select: {
            firstName: true,
            lastName: true
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
          stars: stars,
          comment: comment?.trim() || null,
        },
        select: {
          id: true,
          stars: true,
          comment: true,
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
          stars: stars,
          comment: comment?.trim() || null,
          userId: session?.userId,
          foodItemId: foodItemIdNum,
        },
        select: {
          id: true,
          stars: true,
          comment: true,
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
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const reviews = await prisma.rating.findMany({
      where: {
        status: 'APPROVED',
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        foodItem: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        {
          stars: 'desc', // Sort by highest rating first
        },
        {
          createdAt: 'desc', // Then by newest first
        },
      ],
      take: 10
    });

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
