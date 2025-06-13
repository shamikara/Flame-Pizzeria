import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";

// Define a schema for validating the incoming email
const emailSchema = z.string().email({ message: "Invalid email address." });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // 1. Validate the email
    const validationResult = emailSchema.safeParse(email);
    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid email address provided." }, { status: 400 });
    }

    const validatedEmail = validationResult.data;

    // 2. Check if the email is already subscribed
    const existingSubscription = await prisma.newsletterSubscription.findUnique({
      where: { email: validatedEmail },
    });

    if (existingSubscription) {
      return NextResponse.json({ message: "You are already subscribed!" }, { status: 200 });
    }

    // 3. Create the new subscription
    await prisma.newsletterSubscription.create({
      data: {
        email: validatedEmail,
      },
    });

    return NextResponse.json({ message: "Thank you for subscribing!" }, { status: 201 });

  } catch (error) {
    console.error("[SUBSCRIBE_POST_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}