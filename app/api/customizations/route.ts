import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

const customizationSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  foodItemId: z.number(),
});

export async function GET() {
  try {
    const customizations = await prisma.customization.findMany({
      include: {
        foodItem: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(customizations);
  } catch (error) {
    console.error('Failed to fetch customizations:', error);
    return NextResponse.json({ error: 'Failed to fetch customizations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = customizationSchema.parse(await request.json());

    const newCustomization = await prisma.customization.create({
      data: {
        name: data.name,
        price: data.price,
        foodItemId: data.foodItemId,
      },
      include: {
        foodItem: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(newCustomization, { status: 201 });
  } catch (error) {
    console.error('Failed to create customization:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Customization ID is required' }, { status: 400 });
    }

    const data = customizationSchema.parse(await request.json());

    const updatedCustomization = await prisma.customization.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        price: data.price,
        foodItemId: data.foodItemId,
      },
      include: {
        foodItem: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCustomization);
  } catch (error) {
    console.error('Failed to update customization:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Customization ID is required' }, { status: 400 });
    }

    await prisma.customization.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Customization deleted successfully' });
  } catch (error) {
    console.error('Failed to delete customization:', error);
    return NextResponse.json({ error: 'Failed to delete customization' }, { status: 500 });
  }
}