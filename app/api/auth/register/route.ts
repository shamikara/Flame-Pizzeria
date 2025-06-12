import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth"; // Assuming this is your hashing function

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 }); // 409 Conflict is more appropriate
    }

    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'CUSTOMER', // Assign a default role
      },
    });

    // --- AUTO-LOGIN LOGIC ---
    // 1. Create the session token (JWT)
    const payload = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
    
    const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
    
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h') // Token expires in 24 hours
      .sign(secret);

    // 2. Set the token in a secure, httpOnly cookie
    (await
      // 2. Set the token in a secure, httpOnly cookie
      cookies()).set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // Return success response with user data (without password)
    return NextResponse.json({
      success: true,
      user: payload,
    });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}