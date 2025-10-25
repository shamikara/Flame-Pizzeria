import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const updatePromotionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  buttonText: z.string().optional(),
  buttonLink: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().min(1, "Image URL is required").optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const promotion = await db.promotionBanner.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!promotion) {
      return NextResponse.json({ error: "Promotion banner not found" }, { status: 404 });
    }

    return NextResponse.json({ promotion });
  } catch (error) {
    console.error("Failed to fetch promotion banner:", error);
    return NextResponse.json(
      { error: "Failed to load promotion banner" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const parsed = updatePromotionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const updateData: any = { ...data };

    // Convert string dates to Date objects if they exist
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    // Validate dates if they're being updated
    if (updateData.startDate && updateData.endDate && updateData.startDate > updateData.endDate) {
      return NextResponse.json(
        { error: "Start date must be before end date" },
        { status: 400 }
      );
    }

    const promotion = await db.promotionBanner.update({
      where: { id: parseInt(params.id) },
      data: updateData,
    });

    revalidatePath("/");
    revalidatePath("/dashboard/promotions");

    return NextResponse.json({ promotion });
  } catch (error) {
    console.error("Failed to update promotion banner:", error);
    return NextResponse.json(
      { error: "Failed to update promotion banner" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const parsed = updatePromotionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const updateData: any = { ...data };

    // Convert string dates to Date objects if they exist
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    // Validate dates if they're being updated
    if (updateData.startDate && updateData.endDate && updateData.startDate > updateData.endDate) {
      return NextResponse.json(
        { error: "Start date must be before end date" },
        { status: 400 }
      );
    }

    const promotion = await db.promotionBanner.update({
      where: { id: parseInt(params.id) },
      data: updateData,
    });

    revalidatePath("/");
    revalidatePath("/dashboard/promotions");

    return NextResponse.json({ promotion });
  } catch (error) {
    console.error("Failed to update promotion banner:", error);
    return NextResponse.json(
      { error: "Failed to update promotion banner" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First get the promotion to get the image URL
    const promotion = await db.promotionBanner.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!promotion) {
      return NextResponse.json(
        { error: "Promotion banner not found" },
        { status: 404 }
      );
    }

    // Delete the promotion
    await db.promotionBanner.delete({
      where: { id: parseInt(params.id) },
    });

    // Note: In a production app, you might want to also delete the image file
    // from your storage solution (e.g., S3, local filesystem, etc.)
    // For example:
    // if (promotion.imageUrl.startsWith('/uploads/')) {
    //   const filePath = path.join(process.cwd(), 'public', promotion.imageUrl);
    //   try {
    //     await fs.unlink(filePath);
    //   } catch (err) {
    //     console.error('Failed to delete image file:', err);
    //   }
    // }

    revalidatePath("/");
    revalidatePath("/dashboard/promotions");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete promotion banner:", error);
    return NextResponse.json(
      { error: "Failed to delete promotion banner" },
      { status: 500 }
    );
  }
}
