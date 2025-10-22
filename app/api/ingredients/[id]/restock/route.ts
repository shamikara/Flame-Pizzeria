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
    const allowedRoles = new Set<user_role>([
      user_role.ADMIN,
      user_role.MANAGER,
      user_role.STORE_KEEP,
    ]);
    if (!allowedRoles.has(session.role as user_role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { quantity, expiryDate } = await request.json();

    const amount = Number(quantity);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const ingredientId = Number(params.id);

    if (!Number.isInteger(ingredientId) || ingredientId <= 0) {
      return NextResponse.json({ error: "Invalid ingredient id" }, { status: 400 });
    }

    // Get current stock
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!ingredient) {
      return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
    }

    // Update stock (add to existing)
    const updateData: {
      stock: number;
      updatedAt: Date;
      expiryDate?: Date;
    } = {
      stock: ingredient.stock + amount,
      updatedAt: new Date(),
    };

    // Update expiry date if provided
    if (expiryDate) {
      const newExpiry = new Date(expiryDate);

      if (Number.isNaN(newExpiry.getTime())) {
        return NextResponse.json({ error: "Invalid expiry date" }, { status: 400 });
      }

      updateData.expiryDate = newExpiry;
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