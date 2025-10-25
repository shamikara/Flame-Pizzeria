import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const promotionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  buttonText: z.string().optional(),
  buttonLink: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().min(1, "Image URL is required"),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";
    let promotions;

    if (activeOnly) {
      const now = new Date();
      promotions = await db.promotionBanner.findMany({
        where: {
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
        orderBy: { startDate: "asc" },
      });
    } else {
      promotions = await db.promotionBanner.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ promotions });
  } catch (error) {
    console.error("Failed to fetch promotion banners:", error);
    return NextResponse.json({ error: "Failed to load promotion banners" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = promotionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Invalid start or end date" }, { status: 400 });
    }

    if (startDate > endDate) {
      return NextResponse.json({ error: "Start date must be before end date" }, { status: 400 });
    }

    const promotion = await db.promotionBanner.create({
      data: {
        title: data.title,
        description: data.description,
        buttonText: data.buttonText?.trim() || null,
        buttonLink: data.buttonLink?.trim() || null,
        imageUrl: data.imageUrl,
        startDate,
        endDate,
        isActive: data.isActive ?? true,
      },
    });

    revalidatePath("/");

    return NextResponse.json({ promotion });
  } catch (error) {
    console.error("Failed to create promotion banner:", error);
    return NextResponse.json({ error: "Failed to create promotion banner" }, { status: 500 });
  }
}
