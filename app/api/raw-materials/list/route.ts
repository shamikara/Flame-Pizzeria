import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const materials = await db.rawMaterial.findMany({
      include: { supplier: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(materials);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}