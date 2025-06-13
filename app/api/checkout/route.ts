import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { hashPassword } from "@/lib/auth"; // Ensure this function exists and works

// Helper function to calculate the total price
function calculateTotal(items: any[]) {
  if (!items || !Array.isArray(items)) return 0;

  return items.reduce((total, item) => {
    const itemBasePrice = item.price || 0;
    // Safely parse customizations if they exist
    let customizationsPrice = 0;
    if (item.customizations && Array.isArray(item.customizations)) {
      customizationsPrice = item.customizations.reduce(
        (sum: number, customization: any) => sum + (customization.price || 0),
        0
      );
    }
    return total + (itemBasePrice + customizationsPrice) * item.quantity;
  }, 0);
}

// The Main API Route
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    const { 
      email, 
      firstName, 
      lastName, 
      address, 
      phone, 
      notes, 
      cartItems,
      password
    } = await request.json();

    let finalUserId: string;

    if (session) {
      // --- SCENARIO 1: USER IS LOGGED IN ---
      console.log("Checkout for logged-in user:", session.userId);
      finalUserId = session.userId;
    } else {
      // --- SCENARIO 2: GUEST CHECKOUT ---
      console.log("Guest checkout for email:", email);
      
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please log in." },
          { status: 409 }
        );
      }

      if (!password) {
        return NextResponse.json({ error: "Password is required for new user registration." }, { status: 400 });
      }

      const hashedPassword = await hashPassword(password);

      const newUser = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: hashedPassword,
          role: 'CUSTOMER',
          address: address,
          contact: phone,
        },
      });

      finalUserId = newUser.id;
      console.log(`Auto-registered new user ${newUser.id} for email ${email}`);
    }

    // --- CREATE THE ORDER (runs for both scenarios) ---
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cannot create an empty order." }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        userId: finalUserId,
        status: "PENDING",
        total: calculateTotal(cartItems), 
        address: address,
        phone: phone,
        notes,
        
        // --- THIS IS THE FIX ---
        // Add the missing `type` field. We'll default all online orders to 'DELIVERY'.
        // Make sure 'DELIVERY' is a valid value in your OrderType enum in schema.prisma.
        type: 'DELIVERY', 

        items: {
          create: cartItems.map((item: any) => ({
            foodItemId: item.productId,
            quantity: item.quantity,
            price: item.price,
            customizations: item.customizations || [], 
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
    });

  } catch (error) {
    console.error("[CHECKOUT_POST_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}