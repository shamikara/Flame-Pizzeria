"use server";

import db from "@/lib/db";
import { RecipeStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function approveRecipe(recipeId: string) {
  try {
    await db.recipe.update({
      where: { id: recipeId },
      data: { status: RecipeStatus.APPROVED },
    });

    // When a recipe is approved, we need to revalidate both the dashboard page
    // and the public-facing recipe board page to show the changes.
    revalidatePath('/dashboard/users');
    revalidatePath('/recipes-board'); // Use the correct path for your public recipe page

    return { success: true };
  } catch (error) {
    console.error("Failed to approve recipe:", error);
    return { success: false, message: "Could not approve the recipe." };
  }
}

export async function rejectRecipe(recipeId: string) {
  try {
    await db.recipe.update({
      where: { id: recipeId },
      data: { status: RecipeStatus.REJECTED },
    });

    revalidatePath('/dashboard/users');

    return { success: true };
  } catch (error) {
    console.error("Failed to reject recipe:", error);
    return { success: false, message: "Could not reject the recipe." };
  }
}