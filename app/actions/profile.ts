"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { comparePassword, hashPassword } from "@/lib/auth";

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  contact: z.string().optional(),
  address: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export async function updateProfile(data: z.infer<typeof profileSchema>) {
  const session = getServerSession();
  if (!session) return { error: "Not authenticated" };

  try {
    await db.user.update({
      where: { id: session.userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        contact: data.contact,
        address: data.address,
      },
    });
    return { success: "Profile updated successfully." };
  } catch (error) {
    return { error: "Failed to update profile." };
  }
}

export async function changePassword(data: z.infer<typeof passwordSchema>) {
  const session = getServerSession();
  if (!session) return { error: "Not authenticated" };

  try {
    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) return { error: "User not found." };

    const isPasswordCorrect = await comparePassword(data.currentPassword, user.password);
    if (!isPasswordCorrect) return { error: "Incorrect current password." };
    
    const hashedNewPassword = await hashPassword(data.newPassword);

    await db.user.update({
      where: { id: session.userId },
      data: { password: hashedNewPassword },
    });
    return { success: "Password changed successfully." };
  } catch (error) {
    return { error: "Failed to change password." };
  }
}