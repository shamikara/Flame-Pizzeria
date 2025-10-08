import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { hashPassword } from "@/lib/auth";
import { OrderType, OrderStatus } from "@prisma/client";

interface CartItem {
  productId: string;
  price: number;
  quantity: number;
  customizations?: { name: string; price: number }[];
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const customizationsPrice = item.customizations?.reduce((sum, c) => sum + c.price, 0) ?? 0;
    return total + (item.price + customizationsPrice) * item.quantity;
  }, 0);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    const { email, firstName, lastName, address, phone, notes, cartItems, password } = await request.json();

    let finalUserId: string;

    // ✅ Authenticated user
    if (session) {
      finalUserId = session.userId;
    } else {
      // ✅ Guest user – check if email exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return NextResponse.json({ error: "Account exists. Please log in." }, { status: 409 });

      if (!password) return NextResponse.json({ error: "Password required for guest registration." }, { status: 400 });
      const hashedPassword = await hashPassword(password);

      const newUser = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: hashedPassword,
          role: "CUSTOMER",
          address,
          contact: phone,
        },
      });
      finalUserId = newUser.id;
    }

    if (!cartItems || cartItems.length === 0) return NextResponse.json({ error: "Cannot create empty order." }, { status: 400 });

    // ✅ Create order as PENDING
    const order = await prisma.order.create({
      data: {
        userId: finalUserId,
        status: OrderStatus.PENDING,
        type: OrderType.DELIVERY,
        total: calculateTotal(cartItems),
        address,
        phone,
        notes,
        items: {
          create: cartItems.map((item: CartItem) => ({
            foodItemId: item.productId,
            quantity: item.quantity,
            price: item.price,
            customizations: item.customizations ?? [],
          })),
        },
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("[CHECKOUT_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
