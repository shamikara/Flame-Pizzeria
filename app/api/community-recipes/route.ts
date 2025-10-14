import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { recipe_status } from "@prisma/client";

// GET - Fetch approved recipes for public board
export async function GET() {
  try {
    const recipes = await prisma.communityRecipe.findMany({
      where: { status: recipe_status.APPROVED },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Failed to fetch recipes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST - Create new recipe (customers only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, imageUrl } = await request.json();

    if (!name || !description) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 });
    }

    const recipe = await prisma.communityRecipe.create({
      data: {
        name,
        description,
        imageUrl,
        authorId: session.userId,
        status: recipe_status.PENDING,
      },
    });

    return NextResponse.json({ 
      success: true, 
      recipe,
      message: "Recipe submitted for approval!" 
    });
  } catch (error) {
    console.error("Failed to create recipe:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}