import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import db from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const recipeId = params.id;

    // Verify the recipe belongs to the user
    const recipe = await db.recipe.findUnique({
      where: { id: recipeId },
      select: { userId: true },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    if (recipe.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this recipe' },
        { status: 403 }
      );
    }

    // Delete the recipe (cascading deletes will handle related records)
    await db.recipe.delete({
      where: { id: recipeId },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Recipe deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}
