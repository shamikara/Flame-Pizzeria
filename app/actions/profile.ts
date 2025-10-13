"use server";

import { z } from "zod";
import db from "@/lib/db";
import { getServerSession } from "@/lib/session"; // Your server-side session function
import { comparePassword, hashPassword } from "@/lib/auth";

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  contact: z.string().min(10, "Phone number is required"),
  address: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

// CHANGE 1: Add 'async' to the function signature
export async function updateProfile(data: z.infer<typeof profileSchema>) {
  // CHANGE 2: Add 'await' to get the result of the Promise
  const session = await getServerSession();
  if (!session) return { error: "Not authenticated" };

  try {
    await db.user.update({
      where: { id: session.userId }, // This will now work correctly
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

// CHANGE 3: Add 'async' to the function signature
export async function changePassword(data: z.infer<typeof passwordSchema>) {
  // CHANGE 4: Add 'await' to get the result of the Promise
  const session = await getServerSession();
  if (!session) return { error: "Not authenticated" };

  try {
    const user = await db.user.findUnique({ where: { id: session.userId } }); // This will now work
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