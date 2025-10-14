"use server";

import db from "@/lib/db";
import { recipe_status } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function approveRecipe(recipeId: string) {
  try {
    await db.communityRecipe.update({
      where: { id: recipeId },
      data: { status: recipe_status.APPROVED },
    });

    revalidatePath('/dashboard/users');
    revalidatePath('/recipes-board');

    return { success: true };
  } catch (error) {
    console.error("Failed to approve recipe:", error);
    return { success: false, message: "Could not approve the recipe." };
  }
}

export async function rejectRecipe(recipeId: string) {
  try {
    await db.communityRecipe.update({
      where: { id: recipeId },
      data: { status: recipe_status.REJECTED },
    });

    revalidatePath('/dashboard/users');

    return { success: true };
  } catch (error) {
    console.error("Failed to reject recipe:", error);
    return { success: false, message: "Could not reject the recipe." };
  }
}