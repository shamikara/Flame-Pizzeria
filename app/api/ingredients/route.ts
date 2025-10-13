import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';
import { MeasurementUnit } from '@prisma/client';

const createSchema = z.object({
  name: z.string(),
  stock: z.number(),
  unit: z.nativeEnum(MeasurementUnit),
  restockThreshold: z.number(),
  supplierId: z.string().optional(), 
});

export async function POST(request: Request) {
  try {
    const data = createSchema.parse(await request.json());

    const newIngredient = await db.ingredient.create({
      data: {
        name: data.name,
        stock: data.stock,
        unit: data.unit,
        restockThreshold: data.restockThreshold,
        supplierId: data.supplierId ? Number(data.supplierId) : null, 
      },
      include: { supplier: true },
    });

    return NextResponse.json(newIngredient, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
