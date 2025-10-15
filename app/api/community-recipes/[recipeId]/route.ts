import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "@/lib/session";

// DELETE - Delete recipe (only by author)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { recipeId: number } }
) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recipe = await prisma.communityrecipe.findUnique({
      where: { id: Number(params.recipeId) },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Only author or admin can delete
    if (recipe.authorId !== session.userId && session.role !== 'ADMIN' && session.role !== 'MANAGER') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.communityrecipe.delete({
      where: { id: Number(params.recipeId) },
    });

    return NextResponse.json({ success: true, message: "Recipe deleted" });
  } catch (error) {
    console.error("Failed to delete recipe:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}