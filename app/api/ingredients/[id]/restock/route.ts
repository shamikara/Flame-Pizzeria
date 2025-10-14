import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { user_role } from "@prisma/client";

export async function PATCH(    
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins, managers, and storekeepers can restock
    const allowedRoles = [user_role.ADMIN, user_role.MANAGER, user_role.STORE_KEEP];
    if (!allowedRoles.includes(session.role as user_role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { quantity, expiryDate } = await request.json();

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const ingredientId = parseInt(params.id);

    // Get current stock
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!ingredient) {
      return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
    }

    // Update stock (add to existing)
    const updateData: any = {
      stock: ingredient.stock + parseFloat(quantity),
      updatedAt: new Date(),
    };

    // Update expiry date if provided
    if (expiryDate) {
      updateData.expiryDate = new Date(expiryDate);
    }

    const updatedIngredient = await prisma.ingredient.update({
      where: { id: ingredientId },
      data: updateData,
    });

    return NextResponse.json({ 
      success: true, 
      ingredient: updatedIngredient,
      message: `Added ${quantity} ${ingredient.unit} to stock`
    });
  } catch (error) {
    console.error("Failed to restock ingredient:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}