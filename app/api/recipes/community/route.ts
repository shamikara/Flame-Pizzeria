import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import db from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession();
    
    // Allow access to community recipes even if not logged in
    // But we'll track if user is authenticated for UI purposes
    const userId = session?.userId || null;

    const recipes = await db.recipe.findMany({
      where: {
        isActive: true, // Only show active recipes
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        likes: userId ? {
          where: { userId },
          select: { userId: true },
        } : false,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 12, // Limit to 12 most recent recipes
    });

    // Convert Date objects to ISO strings for JSON serialization
    const serializedRecipes = recipes.map(recipe => ({
      ...recipe,
      createdAt: recipe.createdAt.toISOString(),
      updatedAt: recipe.updatedAt.toISOString(),
      likes: recipe.likes || [],
      isLiked: userId ? recipe.likes?.length > 0 : false,
    }));

    return NextResponse.json({ 
      recipes: serializedRecipes,
      hasMore: recipes.length === 12, // Indicate if there are more recipes to load
    });
  } catch (error) {
    console.error('Error fetching community recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community recipes' },
      { status: 500 }
    );
  }
}
