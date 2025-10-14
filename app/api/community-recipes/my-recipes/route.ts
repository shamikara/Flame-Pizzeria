import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "@/lib/session";

export const dynamic = 'force-dynamic';

// GET - Fetch current user's recipes
export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recipes = await prisma.communityrecipe.findMany({
      where: { authorId: session.userId },
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
    console.error("Failed to fetch user recipes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}