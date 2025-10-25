import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import db from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const recipes = await db.recipe.findMany({
      where: {
        userId: session.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        ingredients: true,
        instructions: {
          orderBy: {
            stepNumber: 'asc',
          },
        },
      },
    });

    // Convert Decimal to number for JSON serialization
    const serializedRecipes = recipes.map(recipe => ({
      ...recipe,
      prepTime: Number(recipe.prepTime),
      cookTime: Number(recipe.cookTime),
      servings: Number(recipe.servings),
      ingredients: recipe.ingredients.map(ing => ({
        ...ing,
        amount: Number(ing.amount),
      })),
    }));

    return NextResponse.json({ 
      recipes: serializedRecipes 
    });
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}
