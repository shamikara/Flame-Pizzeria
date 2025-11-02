import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "@/lib/session";

interface MenuItemsData {
  items: MenuItem[];
  subtotal: number;
  tax: number;
  depositPercentage: number;
  depositDue: number;
  total: number;
  [key: string]: any;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CateringRequest {
  id: number;
  menuItems: unknown;
  status?: string;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    // Use the existing, correct server-side session function.
    const session = await getServerSession();

    if (!session || !session.userId) {
      return NextResponse.json({
        error: "Authentication required",
        requiresLogin: true
      }, { status: 401 });
    }

    const { requestId } = await request.json();

    // Validate requestId
    if (!requestId || isNaN(parseInt(requestId))) {
      return NextResponse.json({
        error: "Valid request ID is required"
      }, { status: 400 });
    }

    const requestIdNum = parseInt(requestId);

    // Find the catering request with proper error handling
    const cateringRequest = await prisma.cateringrequest.findUnique({
      where: { id: requestIdNum }
    }) as CateringRequest | null;

    if (!cateringRequest) {
      return NextResponse.json({
        error: `Catering request with ID ${requestId} not found`
      }, { status: 404 });
    }

    // Safely parse menu items with type checking
    const menuItems = cateringRequest.menuItems as MenuItemsData;
    
    // Validate menu items structure
    if (!menuItems || typeof menuItems !== 'object') {
      console.error('Invalid menu items data:', menuItems);
      return NextResponse.json({
        error: "Invalid menu items data"
      }, { status: 400 });
    }

    const { depositDue } = menuItems;
    
    // Validate deposit amount
    if (typeof depositDue !== 'number' || depositDue <= 0) {
      console.error('Invalid deposit amount:', { depositDue, menuItems });
      return NextResponse.json({
        error: "Invalid deposit amount",
        details: {
          depositDue,
          hasMenuItems: !!menuItems,
          menuItemsType: typeof menuItems
        }
      }, { status: 400 });
    }

    // The API's only job is to validate the request and session.
    // The client will be redirected to the checkout page, which will then
    // create the payment intent. This matches the food order flow.
    console.log(`[CATERING_CHECKOUT] Validated request ${requestIdNum} for user ${session.userId}. Ready for payment page.`);

    return NextResponse.json({
      success: true,
      message: "Request validated. Proceeding to payment.",
      cateringRequestId: requestIdNum
    });

  } catch (error) {
    console.error("[CATERING_CHECKOUT_ERROR]", error);
    
    // More detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json({
      error: "Failed to process checkout",
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }
}
