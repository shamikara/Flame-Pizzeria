import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/db";
import { sendEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface MenuItem {
  name: string;
  price: number;
  quantity: number;
}

interface MenuTotals {
  subtotal: number;
  serviceCharge: number;
  tax: number;
  total: number;
}

interface MenuItems {
  menuDetails?: MenuItem[];
  totals?: MenuTotals;
}

type JsonValue = string | number | boolean | JsonObject | JsonArray | null;
interface JsonObject { [key: string]: JsonValue; }
interface JsonArray extends Array<JsonValue> {}

interface CateringRequest {
  id: number;
  status: string;
  contactEmail: string | null;
  contactName: string | null;
  guestCount: number;
  eventDate: Date;
  menuItems: JsonValue;
  depositAmount: number | null;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export const POST = async (req: Request) => {
  try {
    const { requestId, paymentIntentId } = await req.json();

    if (!requestId || !paymentIntentId) {
      return NextResponse.json({ error: "Missing requestId or paymentIntentId" }, { status: 400 });
    }

    // Retrieve payment details from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    // Get the full catering request with user details
    const request = await prisma.cateringrequest.update({
      where: { id: Number(requestId) },
      data: { 
        status: "deposit_paid", 
        depositAmount: paymentIntent.amount_received / 100, // Convert from cents to currency
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    }) as unknown as CateringRequest;

    // Parse menuItems JSON if it's a string
    let menuItems: MenuItems = { menuDetails: [], totals: undefined };
    try {
      if (request.menuItems) {
        const parsed = typeof request.menuItems === 'string' 
          ? JSON.parse(request.menuItems) 
          : request.menuItems;
        
        if (parsed && typeof parsed === 'object') {
          menuItems = {
            menuDetails: Array.isArray(parsed.menuDetails) ? parsed.menuDetails : [],
            totals: parsed.totals ? {
              subtotal: Number(parsed.totals.subtotal) || 0,
              serviceCharge: Number(parsed.totals.serviceCharge) || 0,
              tax: Number(parsed.totals.tax) || 0,
              total: Number(parsed.totals.total) || 0
            } : undefined
          };
        }
      }
    } catch (e) {
      console.error('Error parsing menuItems:', e);
    }

    // Send confirmation email
    if (request.contactEmail) {
      try {
        const emailData = {
          name: request.contactName || 
                (request.user ? `${request.user.firstName} ${request.user.lastName}`.trim() : 'Customer'),
          requestId: request.id,
          eventDate: request.eventDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          guestCount: request.guestCount,
          ...(menuItems.totals && {
            billSnapshot: {
              currency: 'LKR',
              subtotal: menuItems.totals.subtotal,
              serviceCharge: menuItems.totals.serviceCharge,
              tax: menuItems.totals.tax,
              total: menuItems.totals.total,
              lines: (menuItems.menuDetails || []).map((item, index) => ({
                id: `item-${index}`,
                name: item?.name || 'Menu Item',
                price: item?.price || 0,
                quantity: item?.quantity || 1,
                lineTotal: (item?.price || 0) * (item?.quantity || 1)
              }))
            }
          })
        };

        await sendEmail({
          to: request.contactEmail,
          subject: 'Deposit Received - Your Event Catering is Confirmed!',
          template: 'catering-confirmation',
          data: emailData
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true, request });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
  }
};
