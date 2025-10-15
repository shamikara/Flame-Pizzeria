import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const MAX_FILE_SIZE = 500 * 1024; // 500 KB
const UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "img",
  "noticeboard",
  "communityRecipe"
);

function sanitizeFileName(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || "recipe";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");
    const recipeName = formData.get("recipeName");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }

    if (!recipeName || typeof recipeName !== "string") {
      return NextResponse.json(
        { error: "Recipe name is required" },
        { status: 400 }
      );
    }

    if (file.type !== "image/png") {
      return NextResponse.json(
        { error: "Only PNG images are allowed" },
        { status: 415 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image must be 500KB or smaller" },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const fileName = `${sanitizeFileName(recipeName)}.png`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    await fs.writeFile(filePath, buffer);

    const imageUrl = `/img/noticeboard/communityRecipe/${fileName}`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Failed to upload recipe image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
