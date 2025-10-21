import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { order_status } from "@prisma/client";
import { getServerSession } from "@/lib/session";
import { deductInventoryForOrder, InventoryError } from "@/lib/inventory";

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentIntentId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update order status to CONFIRMED
    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id: parseInt(orderId) },
        include: {
          items: {
            include: {
              foodItem: {
                include: {
                  recipe: {
                    include: {
                      ingredients: {
                        include: {
                          ingredient: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!existing) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (!existing.inventoryDeducted) {
        await deductInventoryForOrder(existing, tx);
      }

      return tx.order.update({
        where: { id: existing.id },
        data: {
          status: order_status.CONFIRMED,
          inventoryDeducted: true,
        },
      });
    });

    // Optionally create a payment record
    if (paymentIntentId) {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: order.total,
          method: "ONLINE",
          status: "COMPLETED",
          transactionId: paymentIntentId,
        },
      });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    if (error instanceof InventoryError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }

    if ((error as Error).message === "ORDER_NOT_FOUND") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.error("[CONFIRM_PAYMENT_ERROR]", error);
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
  }
}