"use server";

import db from "@/lib/db";
import { recipe_status } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/session";

async function ensureModerator() {
  const session = await getServerSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "MANAGER")) {
    return null;
  }
  return session;
}

export async function approveRecipe(recipeId: number) {
  try {
    const session = await ensureModerator();
    if (!session) {
      return { success: false, message: "Unauthorized" };
    }

    await db.communityrecipe.update({
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

export async function rejectRecipe(recipeId: number) {
  try {
    const session = await ensureModerator();
    if (!session) {
      return { success: false, message: "Unauthorized" };
    }

    await db.communityrecipe.update({
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

type UpdateRecipePayload = {
  name: string;
  description: string;
  imageUrl?: string | null;
  status: recipe_status;
};

export async function updateCommunityRecipe(recipeId: number, data: UpdateRecipePayload) {
  try {
    const session = await ensureModerator();
    if (!session) {
      return { success: false, message: "Unauthorized" };
    }

    await db.communityrecipe.update({
      where: { id: recipeId },
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl && data.imageUrl.trim() !== "" ? data.imageUrl : null,
        status: data.status,
      },
    });

    revalidatePath('/dashboard/users');
    revalidatePath('/recipes-board');

    return { success: true };
  } catch (error) {
    console.error("Failed to update recipe:", error);
    return { success: false, message: "Could not update the recipe." };
  }
}

export async function deleteCommunityRecipe(recipeId: number) {
  try {
    const session = await ensureModerator();
    if (!session) {
      return { success: false, message: "Unauthorized" };
    }

    await db.communityrecipe.delete({
      where: { id: recipeId },
    });

    revalidatePath('/dashboard/users');
    revalidatePath('/recipes-board');

    return { success: true };
  } catch (error) {
    console.error("Failed to delete recipe:", error);
    return { success: false, message: "Could not delete the recipe." };
  }
}