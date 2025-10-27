import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { requestId, paymentIntentId } = await request.json();

    if (!requestId) {
      return NextResponse.json({ error: "Request ID required" }, { status: 400 });
    }

    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[CATERING_CONFIRM_PAYMENT] Starting confirmation for catering request:", requestId);

    // Update catering request status to CONFIRMED
    const cateringRequest = await prisma.cateringrequest.update({
      where: { id: parseInt(requestId) },
      data: {
        status: "CONFIRMED"
      },
      select: {
        id: true,
        eventType: true,
        eventDate: true,
        guestCount: true,
        contactName: true,
        contactEmail: true,
        menuItems: true,
        specialRequests: true,
        status: true
      }
    });

    console.log("[CATERING_CONFIRM_PAYMENT] Catering request status updated to CONFIRMED:", cateringRequest.id);

    // Update payment status to COMPLETED
    const payment = await prisma.payment.updateMany({
      where: {
        orderId: parseInt(requestId),
        transactionId: paymentIntentId,
        status: "PENDING"
      },
      data: {
        status: "COMPLETED"
      }
    });

    if (payment.count === 0) {
      console.error("[CATERING_CONFIRM_PAYMENT] Payment not found:", requestId, paymentIntentId);
      return NextResponse.json({ error: "Payment not found or already completed" }, { status: 404 });
    }

    console.log("[CATERING_CONFIRM_PAYMENT] Payment status updated to COMPLETED for request:", requestId);

    // Fetch the catering request details for email
    const requestDetails = await prisma.cateringrequest.findUnique({
      where: { id: parseInt(requestId) },
      select: {
        id: true,
        eventType: true,
        eventDate: true,
        guestCount: true,
        contactName: true,
        contactEmail: true,
        menuItems: true,
        specialRequests: true,
        status: true
      }
    });

    if (!requestDetails) {
      console.error("[CATERING_CONFIRM_PAYMENT] Catering request not found:", requestId);
      return NextResponse.json({ error: "Catering request not found" }, { status: 404 });
    }

    console.log("[CATERING_CONFIRM_PAYMENT] Found catering request, sending confirmation email...");

    // Send payment confirmation email
    try {
      const menuItems = requestDetails.menuItems as any;
      const billSnapshot = menuItems?.billSnapshot || menuItems?.totals;
      const depositDue = menuItems?.depositDue;

      if (requestDetails.contactEmail && billSnapshot && depositDue) {
        const emailResult = await sendEmail({
          to: requestDetails.contactEmail,
          subject: `Catering Deposit Confirmed - Request #${requestDetails.id}`,
          template: "catering-confirmation",
          data: {
            name: requestDetails.contactName,
            requestId: requestDetails.id,
            eventDate: requestDetails.eventDate.toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            guestCount: requestDetails.guestCount,
            billSnapshot: {
              currency: 'LKR',
              subtotal: billSnapshot.subtotal || 0,
              serviceCharge: billSnapshot.serviceCharge || 0,
              tax: billSnapshot.tax || 0,
              total: billSnapshot.total || 0,
              lines: [] // Empty for now, can be populated with menu items later
            }
          }
        });

        console.log("[CATERING_CONFIRM_PAYMENT] Email send result:", emailResult);
      } else {
        console.log("[CATERING_CONFIRM_PAYMENT] Missing email or billing data, skipping email");
      }
    } catch (emailError) {
      console.error("[CATERING_CONFIRM_PAYMENT_EMAIL_ERROR]", emailError);
      // Don't fail the payment confirmation if email fails
    }

    console.log("[CATERING_CONFIRM_PAYMENT] Payment confirmation completed successfully for request:", requestId);

    return NextResponse.json({ success: true, request: cateringRequest });

  } catch (error) {
    console.error("[CATERING_CONFIRM_PAYMENT_ERROR]", error);
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
  }
}
