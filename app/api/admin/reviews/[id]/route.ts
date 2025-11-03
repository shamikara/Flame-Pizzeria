import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    console.log('Session data:', JSON.stringify(session, null, 2));
    
    if (!session) {
      console.error('No session found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (session.role !== 'ADMIN') {
      console.error('User is not an admin. Role:', session.role);
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { status, adminComment } = await request.json();
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Ensure we have a valid user ID from the session
    if (!session.userId) {
      console.error('User ID not found in session:', session);
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      );
    }

    console.log('Updating review with data:', {
      reviewId: parseInt(params.id),
      status,
      adminComment: adminComment ? 'Provided' : 'Not provided',
      reviewedById: session.userId,
      userRole: session.role
    });

    try {
      // First, update the review status
      const updatedReview = await prisma.rating.update({
        where: { id: parseInt(params.id) },
        data: {
          status,
          adminComment,
          reviewedAt: new Date(),
          reviewedById: session.userId,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          foodItem: {
            select: {
              id: true,
              name: true,
            },
          },
          reviewedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // If review is approved, update the food item's average rating
      if (status === 'APPROVED') {
        // Get all approved ratings for this food item
        const approvedRatings = await prisma.rating.findMany({
          where: {
            foodItemId: updatedReview.foodItemId,
            status: 'APPROVED',
          },
          select: {
            stars: true,
          },
        });

        // Calculate new average rating
        const totalStars = approvedRatings.reduce((sum, r) => sum + (r.stars || 0), 0);
        const averageRating = approvedRatings.length > 0 
          ? Math.round((totalStars / approvedRatings.length) * 10) / 10 
          : 0;

        // Update the food item with the new average rating and review count
        // Using $executeRaw to handle potential missing columns
        await prisma.$executeRaw`
          UPDATE fooditem
          SET 
            averageRating = ${averageRating},
            reviewCount = ${approvedRatings.length},
            updatedAt = NOW()
          WHERE id = ${updatedReview.foodItemId}
        `;
      }

      console.log('Successfully updated review:', updatedReview.id);
      
      // Prepare the response data
      const responseData = {
        id: updatedReview.id,
        status: updatedReview.status,
        comment: updatedReview.comment,
        adminComment: updatedReview.adminComment,
        stars: updatedReview.stars,
        createdAt: updatedReview.createdAt,
        updatedAt: updatedReview.updatedAt,
        reviewedAt: updatedReview.reviewedAt?.toISOString(),
        user: {
          id: updatedReview.user.id,
          firstName: updatedReview.user.firstName,
          lastName: updatedReview.user.lastName,
          email: updatedReview.user.email,
        },
        foodItem: {
          id: updatedReview.foodItem.id,
          name: updatedReview.foodItem.name,
        },
        reviewedBy: updatedReview.reviewedBy ? {
          id: updatedReview.reviewedBy.id,
          name: `${updatedReview.reviewedBy.firstName} ${updatedReview.reviewedBy.lastName}`,
          email: updatedReview.reviewedBy.email,
        } : null,
      };

      return NextResponse.json(responseData);
    } catch (error) {
      const prismaError = error as any;
      console.error('Prisma error:', {
        code: prismaError.code,
        message: prismaError.message,
        meta: prismaError.meta
      });
      
      // Forward the error to the outer catch block
      throw new Error(prismaError.message || 'Failed to update review');
    }
  } catch (error) {
    console.error('Error updating review status:', error);
    
    // Check for Prisma errors
    if (error instanceof Error) {
      if ('code' in error) {
        // This is a Prisma error
        return NextResponse.json(
          { 
            error: 'Database error',
            details: {
              code: error.code,
              message: error.message,
              meta: (error as any).meta
            }
          },
          { status: 500 }
        );
      }
      
      // Other errors
      return NextResponse.json(
        { 
          error: 'Failed to update review status',
          details: error.message 
        },
        { status: 500 }
      );
    }
    
    // Unknown error
    return NextResponse.json(
      { error: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
