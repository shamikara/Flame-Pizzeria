import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getServerSession } from "@/lib/session"

// --- Helper Functions (keep these or import them) ---

// You should have these functions defined elsewhere and import them
async function generateRandomPassword(): Promise<string> {
  // Your logic to generate a secure random password
  return Math.random().toString(36).slice(-8);
}

async function createUser(data: any) {
  // Your logic to create a user, including password hashing
  // This is a simplified example
  return prisma.user.create({ data });
}

async function sendAccountEmail(email: string, password_or_link: string) {
  // Your logic to send a welcome email with credentials or a login link
  console.log(`Sending account details to ${email}...`);
}

function calculateTotal(items: any[]) {
  // Your existing total calculation logic is good
  return items.reduce((total, item) => {
    const itemBasePrice = item.price || 0;
    const customizationsPrice = item.customizations?.reduce(
      (sum: number, customization: any) => sum + (customization.price || 0),
      0,
    ) || 0;
    return total + (itemBasePrice + customizationsPrice) * item.quantity;
  }, 0);
}


// --- The Main API Route ---

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    const body = await request.json();
    const { 
      userId: bodyUserId, // The userId sent from the client, if any
      email, 
      firstName, 
      lastName, 
      address, 
      city, 
      state, 
      zipCode, 
      phone, 
      items, 
      notes 
    } = body;

    let finalUserId: string;
    let wasNewUserCreated = false;

    if (session) {
      // --- SCENARIO 1: USER IS LOGGED IN ---
      console.log("Checkout initiated by logged-in user:", session.userId);
      
      // Security Check: Ensure the session user is the one placing the order
      if (bodyUserId && bodyUserId !== session.userId) {
        return NextResponse.json({ error: "Unauthorized operation" }, { status: 403 });
      }
      
      finalUserId = session.userId; // Trust the secure server session

    } else {
      // --- SCENARIO 2: GUEST CHECKOUT ---
      console.log("Checkout initiated by guest:", email);

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // **CRITICAL CHANGE**: If user exists, do not proceed.
        // Tell the frontend (409 Conflict) so it can prompt the user to log in.
        return NextResponse.json(
          { error: "An account with this email already exists. Please log in." },
          { status: 409 }
        );
      }

      // If we are here, it's a new guest. Auto-register them.
      const randomPassword = await generateRandomPassword();
      const newUser = await createUser({
        email,
        firstName,
        lastName,
        password: randomPassword, // Your createUser function should handle hashing
        address, city, state, zipCode, phone,
        role: 'CUSTOMER',
      });

      finalUserId = newUser.id;
      wasNewUserCreated = true;

      // Send them their new account details
      await sendAccountEmail(email, randomPassword);
    }

     if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cannot create an empty order." }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        userId: finalUserId,
        status: "PENDING",
        total: calculateTotal(items),
        type: "DELIVERY", // Assuming this is a delivery order
        deliveryAddress: `${address}, ${city}, ${state} ${zipCode}`,
       // notes,
        items: {
          create: items.map((item: any) => ({
            foodItemId: item.id, 
            quantity: item.quantity,
            price: item.price,
            customizations: item.customizations ? JSON.stringify(item.customizations) : undefined,
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      newAccount: wasNewUserCreated,
    });

  } catch (error) {
    console.error("Checkout error:", error);
    // Provide a more generic error message to the client
    return NextResponse.json({ error: "Failed to process checkout" }, { status: 500 });
  }
}