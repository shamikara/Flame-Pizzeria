import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { createUser, generateRandomPassword, sendAccountEmail } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName, address, city, state, zipCode, phone, items, notes } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    let userId

    if (!existingUser) {
      // Create new user with random password
      const randomPassword = await generateRandomPassword()

      const newUser = await createUser({
        email,
        firstName,
        lastName,
        password: randomPassword,
        address,
        city,
        state,
        zipCode,
        phone,
      })

      userId = newUser.id

      // Send account details email
      await sendAccountEmail(email, randomPassword)
    } else {
      userId = existingUser.id
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        status: "pending",
        total: calculateTotal(items),
        address,
        city,
        state,
        zipCode,
        phone,
        notes,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            customizations: JSON.stringify(item.customizations),
          })),
        },
      },
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      newAccount: !existingUser,
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Failed to process checkout" }, { status: 500 })
  }
}

function calculateTotal(items: any[]) {
  return items.reduce((total, item) => {
    const itemBasePrice = item.price
    const customizationsPrice = item.customizations.reduce(
      (sum: number, customization: any) => sum + customization.price,
      0,
    )
    return total + (itemBasePrice + customizationsPrice) * item.quantity
  }, 0)
}
