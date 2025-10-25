import { NextResponse } from "next/server";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check if the request contains form data
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type (only allow images)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 2MB' },
        { status: 400 }
      );
    }

    // Create a unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `promo-${uuidv4()}.${fileExtension}`;
    
    // Define the upload directory and ensure it exists
    const uploadDir = join(process.cwd(), 'public', 'img', 'promotions');
    await mkdir(uploadDir, { recursive: true });

    // Convert the file data to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the file to the filesystem
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Return the relative path to the uploaded file
    const imageUrl = `/img/promotions/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      fileName
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
