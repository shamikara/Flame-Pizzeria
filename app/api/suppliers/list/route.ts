import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const suppliers = await db.supplier.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(suppliers);
  } catch (err) {
    console.error("Suppliers API error:", err);
    return NextResponse.json({ error: "Failed to fetch suppliers", details: String(err) }, { status: 500 });
  }
}
