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
        communityRecipes: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            communityRecipes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Transform to match expected format
    const transformedCustomers = customers.map(customer => ({
      ...customer,
      recipes: customer.communityRecipes,
      _count: {
        recipes: customer._count.communityRecipes,
      },
    }));
    
    return NextResponse.json(transformedCustomers);
  } catch (error) {
    console.error("Failed to fetch customers with recipes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}