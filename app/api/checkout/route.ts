import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { hashPassword } from "@/lib/auth";
import { OrderType, OrderStatus } from "@prisma/client";
import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';

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

    // ✅ CLEANUP: Delete pending orders older than 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    try {
      const deletedOrders = await prisma.order.deleteMany({
        where: {
          status: OrderStatus.PENDING,
          createdAt: {
            lt: thirtyMinutesAgo,
          },
        },
      });
      
      if (deletedOrders.count > 0) {
        console.log(`[CHECKOUT] Cleaned up ${deletedOrders.count} pending orders older than 30 minutes`);
      }
    } catch (cleanupError) {
      // Don't fail the checkout if cleanup fails
      console.error("[CHECKOUT_CLEANUP_ERROR]", cleanupError);
    }

    let finalUserId: number;
    let isNewUser = false;
    let newUserData = null;

    // ✅ Authenticated user
    if (session) {
      finalUserId = session.userId;
    } else {
      // ✅ Guest user – check if email exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      
      if (existingUser) {
        return NextResponse.json({ 
          error: "Account already exists. Please log in to continue.", 
          requiresLogin: true 
        }, { status: 409 });
      }

      // Auto-register with email as password
      const hashedPassword = await hashPassword(email);

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
      isNewUser = true;
      newUserData = newUser;  // Store user data for auto-login
    }
    
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cannot create empty order." }, { status: 400 });
    }

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
            foodItemId: parseInt(item.productId),
            quantity: item.quantity,
            price: item.price,
            customizations: item.customizations ?? [],
          })),
        },
      },
    });

    const response = NextResponse.json({ 
      success: true, 
      orderId: order.id,
      isNewUser,
      message: isNewUser 
        ? "Account created! Your password is your email. Please change it after your first login." 
        : "Order created successfully."
    });

    // ✅ Auto-login new users by creating a session cookie
    if (isNewUser && newUserData) {
      const JWT_SECRET = process.env.JWT_SECRET;
      if (JWT_SECRET) {
        const payload = { 
          userId: newUserData.id, 
          role: newUserData.role, 
          email: newUserData.email,
          firstName: newUserData.firstName 
        };
        const token = sign(payload, JWT_SECRET, { expiresIn: '7d' });
        const serializedCookie = serialize('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        });
        response.headers.set('Set-Cookie', serializedCookie);
        console.log('✅ Auto-login cookie set for new user');
      }
    }

    return response;
    
  } catch (error) {
    console.error("[CHECKOUT_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}