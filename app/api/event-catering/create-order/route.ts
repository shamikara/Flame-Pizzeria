import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "@/lib/session";

export const POST = async (req: Request) => {
  try {
    const session = await getServerSession();
    if (!session?.userId) {
      return NextResponse.json({ 
        success: false,
        error: "Unauthorized - User not authenticated",
        toast: {
          title: 'Authentication Required',
          message: 'Please sign in to submit a catering request',
          variant: 'error',
        },
      }, { status: 401 });
    }

    const body = await req.json();
    const {
      menuItems,
      guestCount,
      contactEmail,
      contactPhone = "",
      eventType,
      eventDate,
      contactName,
      specialRequests = "",
      subtotal,
      serviceCharge,
      tax,
      total,
      depositDue
    } = body;

    if (!menuItems || menuItems.length === 0) {
      return NextResponse.json({ error: "No menu items provided" }, { status: 400 });
    }

    if (!eventType || !eventDate || !contactName || !contactEmail) {
      return NextResponse.json(
        { error: "Missing required fields. Please provide event type, date, contact name, and email." },
        { status: 400 }
      );
    }

    // Verify the user exists before creating the order
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User account not found",
        toast: {
          title: 'Account Not Found',
          message: 'Your user account could not be found. Please sign in again.',
          variant: 'error',
        },
      }, { status: 404 });
    }

    const order = await prisma.cateringrequest.create({
      data: {
        userId: session.userId,
        status: "pending",
        eventType,
        eventDate: new Date(eventDate),
        guestCount: Number(guestCount),
        contactName,
        contactEmail,
        contactPhone,
        menuItems: menuItems,
        specialRequests,
        totalAmount: total ? Number(total) : null,
        depositAmount: depositDue ? Number(depositDue) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true,
      orderId: order.id,
      message: "Catering request created successfully"
    });
  } catch (err) {
    console.error("Error creating catering order:", err);
    return NextResponse.json(
      { 
        error: "Failed to create order",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    );
  }
};
