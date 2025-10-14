import { NextResponse } from 'next/server';
import { user_role } from '@prisma/client';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const customers = await prisma.user.findMany({
      where: {
        role: user_role.CUSTOMER,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        communityrecipes: {
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
            communityrecipes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Transform to match expected format
    const transformedCustomers = customers.map((customer: { communityrecipes: any; _count: { communityrecipes: any; }; }) => ({
      ...customer,
      recipes: customer.communityrecipes,
      _count: {
        recipes: customer._count.communityrecipes,
      },
    }));
    
    return NextResponse.json(transformedCustomers);
  } catch (error) {
    console.error("Failed to fetch customers with recipes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}