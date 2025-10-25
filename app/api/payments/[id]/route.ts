import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { orderId: parseInt(params.id) }
    });

    if (!payment) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      createdAt: payment.createdAt,
      method: payment.method,
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return NextResponse.json({
      error: "Failed to fetch payment status"
    }, { status: 500 });
  }
}
