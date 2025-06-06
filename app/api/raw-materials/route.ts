import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';
import { MeasurementUnit } from '@prisma/client';

const createSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unit: z.nativeEnum(MeasurementUnit),
  restockThreshold: z.number(),
  supplierId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const data = createSchema.parse(await request.json());
    const newMaterial = await db.rawMaterial.create({ data });
    return NextResponse.json(newMaterial, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}