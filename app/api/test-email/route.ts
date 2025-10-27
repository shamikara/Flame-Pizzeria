import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET() {
  try {
    console.log("[TEST_EMAIL] Testing email system...");

    const emailResult = await sendEmail({
      to: "shamikara@gmail.com",
      subject: "Test Email from Flames Pizzeria",
      template: "order-confirmation",
      data: {
        orderId: "TEST-123",
        customerName: "Test Customer",
        customerEmail: "shamikara@gmail.com",
        customerPhone: "123-456-7890",
        deliveryAddress: "123 Test Street",
        total: 25.99,
        status: "CONFIRMED",
        orderType: "DELIVERY",
        createdAt: new Date().toISOString(),
        items: [
          {
            name: "Test Pizza",
            quantity: 1,
            basePrice: 25.99,
            lineTotal: 25.99,
            customizations: ["Extra Cheese"]
          }
        ],
        estimatedDelivery: "30-45 minutes"
      }
    });

    console.log("[TEST_EMAIL] Email test result:", emailResult);

    return NextResponse.json({
      success: true,
      message: "Email test completed",
      result: emailResult
    });
  } catch (error) {
    console.error("[TEST_EMAIL] Email test failed:", error);
    return NextResponse.json({
      success: false,
      message: "Email test failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
