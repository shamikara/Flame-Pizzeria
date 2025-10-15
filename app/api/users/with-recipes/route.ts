import { NextResponse } from 'next/server';
import { user_role } from '@prisma/client';
import prisma from '@/lib/db';

type CommunityRecipeSummary = {
  id: number | string;
  name: string;
  status: string;
  createdAt: Date;
};

type CustomerWithCommunityRecipes = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  communityrecipes: CommunityRecipeSummary[];
  _count: {
    communityrecipes: number;
  };
};

export async function GET() {
  try {
    const customers = (await prisma.user.findMany({
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
    })) as unknown as CustomerWithCommunityRecipes[];
    
    // Transform to match expected format
    const transformedCustomers = customers.map((customer) => {
      const { communityrecipes, _count, ...rest } = customer;
      const recipeCount = _count?.communityrecipes ?? 0;

      return {
        ...rest,
        recipes: communityrecipes.map((recipe) => ({
          ...recipe,
          id: Number(recipe.id),
        })),
        _count: {
          recipes: recipeCount,
        },
      };
    });
    
    return NextResponse.json(transformedCustomers);
  } catch (error) {
    console.error("Failed to fetch customers with recipes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}