import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const foods = await db.fooditem.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
    
    return NextResponse.json(foods);
  } catch (error) {
    console.error('Failed to fetch food items:', error);
    return NextResponse.json({ error: 'Failed to fetch food items' }, { status: 500 });
  }
}