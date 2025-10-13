import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const totalItems = await db.foodItem.count();
    const activeItems = await db.foodItem.count({ where: { isActive: true } });
    const totalCategories = await db.category.count();
    
    return NextResponse.json({ totalItems, activeItems, totalCategories });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}