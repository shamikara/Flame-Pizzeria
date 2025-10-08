import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const customers = await prisma.user.findMany({
      where: {
        role: Role.CUSTOMER,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        // Select all recipes for the user
       
        recipes: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        // Also get a count of their recipes
        _count: {
          select: {
            recipes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(customers);
  } catch (error) {
    console.error("Failed to fetch customers with recipes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}