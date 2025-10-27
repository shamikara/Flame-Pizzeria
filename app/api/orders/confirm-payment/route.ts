import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { order_status } from "@prisma/client";
import { getServerSession } from "@/lib/session";
import { deductInventoryForOrder, InventoryError } from "@/lib/inventory";
import { sendEmail } from "@/lib/email";

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

    console.log("[CONFIRM_PAYMENT] Starting confirmation for order:", orderId);

    // Update order status to CONFIRMED
    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id: parseInt(orderId) },
        include: {
          items: true
        },
      });

      if (!existing) {
        console.error("[CONFIRM_PAYMENT] Order not found:", orderId);
        throw new Error("ORDER_NOT_FOUND");
      }

      console.log("[CONFIRM_PAYMENT] Found order:", existing.id, "status:", existing.status);

    // Check if order needs inventory deduction
    console.log("[CONFIRM_PAYMENT] Checking inventory deduction, current inventoryDeducted:", existing.inventoryDeducted)

    // Skip inventory deduction for now - causing issues with recipe relationships
    // TODO: Implement proper inventory management later
    if (!existing.inventoryDeducted) {
      console.log("[CONFIRM_PAYMENT] Skipping inventory deduction - will implement proper recipe system later");
    } else {
      console.log("[CONFIRM_PAYMENT] Inventory already deducted, skipping...");
    }

      const updatedOrder = await tx.order.update({
        where: { id: existing.id },
        data: {
          status: order_status.CONFIRMED,
          inventoryDeducted: true,
        },
      });

      console.log("[CONFIRM_PAYMENT] Order status updated to CONFIRMED:", updatedOrder.id);
      return updatedOrder;
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
      console.log("[CONFIRM_PAYMENT] Payment record created for order:", order.id);
    }

    // Send order confirmation email with full details
    console.log("[CONFIRM_PAYMENT] Starting email process for order:", order.id);
    try {
      const customer = await prisma.user.findUnique({
        where: { id: order.userId },
        select: { email: true, firstName: true, lastName: true },
      });

      if (customer?.email) {
        console.log("[CONFIRM_PAYMENT] Found customer email:", customer.email);

        // Fetch complete order details for email
        const orderWithDetails = await prisma.order.findUnique({
          where: { id: order.id },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                contact: true,
              },
            },
            items: {
              select: {
                quantity: true,
                price: true,
                customizations: true,
                foodItem: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });

        if (orderWithDetails) {
          console.log("[CONFIRM_PAYMENT] Order details fetched, sending email...");

          const emailData = {
            orderId: order.id,
            customerName: `${customer.firstName} ${customer.lastName}`,
            customerEmail: customer.email,
            customerPhone: orderWithDetails.user.contact || 'N/A',
            deliveryAddress: orderWithDetails.address,
            total: order.total,
            status: order.status,
            orderType: orderWithDetails.type,
            createdAt: orderWithDetails.createdAt.toISOString(),
            items: orderWithDetails.items.map(item => ({
              name: item.foodItem.name,
              quantity: item.quantity,
              basePrice: item.price,
              lineTotal: item.price * item.quantity,
              customizations: item.customizations as string[] || [],
            })),
            estimatedDelivery: '30-45 minutes',
          };

          // Send order confirmation email with full details
          const emailResult = await sendEmail({
            to: customer.email,
            subject: `Your Flames Pizzeria order #${order.id} is confirmed!`,
            template: "order-confirmation",
            data: emailData,
          });

          console.log("[CONFIRM_PAYMENT] Email send result:", emailResult);
        } else {
          console.log("[CONFIRM_PAYMENT] No order details found for email");
        }
      } else {
        console.log("[CONFIRM_PAYMENT] No customer email found for order:", order.id);
      }
    } catch (emailError) {
      console.error("[CONFIRM_PAYMENT_EMAIL_ERROR]", emailError);
      // Don't fail the payment confirmation if email fails
    }

    console.log("[CONFIRM_PAYMENT] Order confirmation completed successfully for order:", order.id);

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