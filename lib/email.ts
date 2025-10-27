import nodemailer from "nodemailer"

type EmailResult = {
  success: boolean
  toastTitle: string
  toastMessage: string
  data?: { id: string }
  errorCode?: string
}

type TemplateName =
  | "catering-confirmation"
  | "password-reset"
  | "order-confirmation"
  | "order-receipt"

type TemplateData = {
  "catering-confirmation": {
    name: string
    requestId: number | string
    eventDate?: string
    guestCount?: number
    billSnapshot?: {
      currency: string
      subtotal: number
      serviceCharge: number
      tax: number
      total: number
      lines: Array<{
        id: string
        name: string
        price: number
        quantity: number
        lineTotal: number
      }>
    }
  }
  "password-reset": {
    resetLink: string
  }
  "order-confirmation": {
    orderId: number | string
    customerName: string
    customerEmail: string
    customerPhone: string
    deliveryAddress: string
    total: number
    status: string
    orderType: string
    createdAt: string
    items: Array<{
      name: string
      quantity: number
      basePrice: number
      lineTotal: number
      customizations?: string[]
    }>
    estimatedDelivery?: string
  }
  "order-receipt": {
    orderId: number | string
    customerName: string
    deliveredAt: string
    total: number
    items: Array<{
      name: string
      quantity: number
      basePrice: number
      lineTotal: number
      customizations?: string[]
    }>
    deliveryAddress?: string
  }
}

const smtpUser = process.env.GMAIL_USER
const smtpPass = process.env.GMAIL_APP_PASSWORD
const defaultFrom = process.env.MAIL_FROM ?? smtpUser

const isConfigured = Boolean(smtpUser && smtpPass)

const logMockSend = ({ to, subject, html }: { to: string | string[]; subject: string; html: string }) => {
  console.info("[Email Mock]", { to, subject, preview: html.slice(0, 120) })
}

const createTransport = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

export async function sendEmail<T extends TemplateName>({
  to,
  subject,
  template,
  data,
}: {
  to: string | string[]
  subject: string
  template: T
  data: TemplateData[T]
}): Promise<EmailResult> {
  try {
    const { html, text } = buildTemplate(template, data)
    console.log("[EMAIL] Template built for:", template, "to:", to)

    if (!isConfigured) {
      console.log("[EMAIL] Email not configured, using mock send. SMTP config:", {
        hasUser: Boolean(smtpUser),
        hasPass: Boolean(smtpPass),
        user: smtpUser,
        passLength: smtpPass?.length
      })
      logMockSend({ to, subject, html })
      return {
        success: true,
        toastTitle: "Request Submitted",
        toastMessage: "Email mocked (Gmail credentials not configured)",
        data: { id: "mock-email-id" },
      }
    }

    console.log("[EMAIL] Sending actual email via Gmail...")
    const transporter = createTransport()

    const info = await transporter.sendMail({
      from: defaultFrom,
      to,
      subject,
      html,
      text,
    })

    console.log("[EMAIL] Email sent successfully:", info.messageId)
    return {
      success: true,
      toastTitle: "Email Sent",
      toastMessage: "Confirmation email delivered",
      data: { id: info.messageId },
    }
  } catch (error) {
    console.error("[EMAIL] sendEmail error:", error)
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Unable to process email request"
    return {
      success: false,
      toastTitle: "Email Failed",
      toastMessage: message,
      errorCode: "SMTP_ERROR",
    }
  }
}

function buildTemplate(template: TemplateName, data: TemplateData[TemplateName]) {
  switch (template) {
    case "catering-confirmation": {
      const payload = data as TemplateData["catering-confirmation"]
      const hasBillSnapshot = Boolean(payload.billSnapshot)
      const currency = (value: number) =>
        payload.billSnapshot?.currency
          ? new Intl.NumberFormat('en-LK', {
              style: 'currency',
              currency: payload.billSnapshot.currency,
              maximumFractionDigits: 0,
            }).format(value)
          : `LKR ${value.toLocaleString('en-LK', { maximumFractionDigits: 0 })}` 
      const billLinesHtml = hasBillSnapshot
        ? payload.billSnapshot!.lines
            .map(
              (line) => `
          <tr>
            <td style="padding:6px 8px; border-bottom:1px solid #f1f1f1;">
              <div style="font-weight:600;">${line.name}</div>
              <div style="font-size:12px; color:#555;">${currency(line.price)} × ${line.quantity}</div>
            </td>
            <td style="padding:6px 8px; text-align:right; border-bottom:1px solid #f1f1f1; font-weight:600;">${currency(line.lineTotal)}</td>
          </tr>
        `,
            )
            .join('')
        : ''
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 640px; color: #2f2f2f;">
          <h1 style="color: #e67e22;">Hi ${payload.name},</h1>
          <p>Thanks for choosing Flames Pizzeria for your event. We've logged request <strong>#${payload.requestId}</strong>.</p>
          ${payload.eventDate ? `<p><strong>Event date:</strong> ${payload.eventDate}</p>` : ""}
          ${payload.guestCount ? `<p><strong>Guest count:</strong> ${payload.guestCount}</p>` : ""}
          ${
            hasBillSnapshot
              ? `
          <div style="margin-top:24px; padding:16px; border:1px solid #f1f1f1; border-radius:10px; background:#fff8f1;">
            <h2 style="margin:0 0 12px 0; font-size:18px; color:#d35400;">Estimated cost breakdown</h2>
            <table style="width:100%; border-collapse:collapse; font-size:14px;">
              <tbody>
                ${billLinesHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td style="padding:6px 8px; text-align:right; font-weight:600;">Subtotal</td>
                  <td style="padding:6px 8px; text-align:right; font-weight:600;">${currency(payload.billSnapshot!.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 8px; text-align:right; color:#555;">Service charge</td>
                  <td style="padding:6px 8px; text-align:right; color:#555;">${currency(payload.billSnapshot!.serviceCharge)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 8px; text-align:right; color:#555;">Estimated tax</td>
                  <td style="padding:6px 8px; text-align:right; color:#555;">${currency(payload.billSnapshot!.tax)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 8px; text-align:right; font-weight:700; border-top:2px solid #d35400;">Estimated total</td>
                  <td style="padding:12px 8px; text-align:right; font-weight:700; border-top:2px solid #d35400;">${currency(payload.billSnapshot!.total)}</td>
                </tr>
              </tfoot>
            </table>
            <p style="font-size:12px; color:#7f8c8d; margin-top:12px;">Final pricing will adjust once we confirm menu selections, dietary requirements, and logistics.</p>
          </div>
          `
              : ''
          }
          <p>Our catering team will reach out within 24 hours to finalize the menu and logistics.</p>
          <p>Thank you for choosing Flames Pizzeria for your event!</p>
          <br/><br/>
          <p style="margin-top: 24px;">Cheers,<br/>Flames Pizzeria Catering Team</p>
        </div>
      `
      const textBillLines = hasBillSnapshot
        ? `\n\nEstimated cost breakdown: ${payload.billSnapshot!.lines
            .map(
              (line) => `${line.name} x${line.quantity} = ${currency(line.lineTotal)}`,
            )
            .join('; ')}\nSubtotal: ${currency(payload.billSnapshot!.subtotal)}\nService charge: ${currency(payload.billSnapshot!.serviceCharge)}\nEstimated tax: ${currency(payload.billSnapshot!.tax)}\nEstimated total: ${currency(payload.billSnapshot!.total)}`
        : ''
      const text = `Hi ${payload.name},\nYour catering request (#${payload.requestId}) is in!$${
        payload.eventDate ? `\nEvent date: ${payload.eventDate}` : ""
      }$$${payload.guestCount ? `\nGuest count: ${payload.guestCount}` : ""}${textBillLines}\n\nWe'll be in touch soon.\nFlames Pizzeria Catering Team`
      return { html, text: text.replace(/\$/g, "") }
    }
    case "password-reset": {
      const payload = data as TemplateData["password-reset"]
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 640px; color: #2f2f2f;">
          <h1 style="color: #e67e22;">Reset your password</h1>
          <p>We received a request to reset your password for Flames Pizzeria.</p>
          <p>If you made this request, click the button below. This link is valid for 60 minutes.</p>
          <p style="text-align: center; margin: 32px 0;">
            <a href="${payload.resetLink}"
               style="display:inline-block; padding: 12px 24px; background: #e67e22; color: #fff; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Reset Password
            </a>
          </p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p style="margin-top: 24px;">Flames Pizzeria Support</p>
        </div>
      `
      const text = `We received a password-reset request for your Flames Pizzeria account. Use the link below within 60 minutes.\n\n${payload.resetLink}\n\nIf this wasn't you, ignore this email.` 
      return { html, text }
    }
    case "order-confirmation": {
      const payload = data as TemplateData["order-confirmation"]
      const currency = (amount: number) => `Rs. ${amount.toFixed(2)}`
      
      const itemsHtml = payload.items
        .map((item) => {
          const customizations = item.customizations?.length
            ? `<div style="margin-top:4px; font-size:12px; color:#666;">Add-ons: ${item.customizations.join(", ")}</div>`
            : ""
          return `
            <tr>
              <td style="padding:8px 0;">
                <div style="font-weight:600;">${item.quantity}× ${item.name}</div>
                <div style="font-size:12px; color:#666;">Base price: ${currency(item.basePrice)}</div>
                ${customizations}
              </td>
              <td style="padding:8px 0; text-align:right; font-weight:600;">${currency(item.lineTotal)}</td>
            </tr>
          `
        })
        .join("")

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 640px; color: #2f2f2f; margin:0 auto;">
          <h1 style="color: #e67e22;">Order Confirmed, ${payload.customerName}!</h1>
          <p>Thank you for choosing Flames Pizzeria! Your order <strong>#${payload.orderId}</strong> has been confirmed and payment processed.</p>
          <div style="background:#f8f9fa; padding:16px; border-radius:8px; margin:20px 0;">
            <h3 style="margin:0 0 12px 0; color:#e67e22;">Order Details</h3>
            <p style="margin:4px 0;"><strong>Customer:</strong> ${payload.customerName}</p>
            <p style="margin:4px 0;"><strong>Phone:</strong> ${payload.customerPhone}</p>
            <p style="margin:4px 0;"><strong>Delivery Address:</strong> ${payload.deliveryAddress}</p>
            <p style="margin:4px 0;"><strong>Order Type:</strong> ${payload.orderType}</p>
            ${payload.estimatedDelivery ? `<p style="margin:4px 0;"><strong>Estimated Delivery:</strong> ${payload.estimatedDelivery}</p>` : ""}
          </div>
          <table style="width:100%; border-collapse:collapse; margin-top:20px;">
            <thead>
              <tr>
                <th style="text-align:left; padding-bottom:8px; border-bottom:1px solid #eee;">Items</th>
                <th style="text-align:right; padding-bottom:8px; border-bottom:1px solid #eee;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding-top:12px; border-top:2px solid #e67e22; font-weight:bold;">Grand Total</td>
                <td style="padding-top:12px; border-top:2px solid #e67e22; font-weight:bold; text-align:right;">${currency(payload.total)}</td>
              </tr>
            </tfoot>
          </table>
          <p style="margin-top:24px; color:#666;">We're preparing your order right away. You'll receive updates as your order progresses through our kitchen.</p>
          <p style="margin-top:16px;">Thank you for choosing Flames Pizzeria!<br/>— The Flames Team</p>
        </div>
      `
      
      const textItems = payload.items
        .map((item) => {
          const extras = item.customizations?.length ? ` (Add-ons: ${item.customizations.join(", ")})` : ""
          return `  - ${item.quantity}x ${item.name}${extras} = ${currency(item.lineTotal)}`
        })
        .join("\n")
      const text = `Hi ${payload.customerName},\n\nYour order #${payload.orderId} is confirmed!\n\nOrder Details:\nCustomer: ${payload.customerName}\nPhone: ${payload.customerPhone}\nDelivery Address: ${payload.deliveryAddress}\nOrder Type: ${payload.orderType}\n${payload.estimatedDelivery ? `Estimated Delivery: ${payload.estimatedDelivery}\n` : ""}\n\nItems:\n${textItems}\n\nGrand Total: ${currency(payload.total)}\n\nWe're preparing your order now. You'll receive updates soon!\n\nThank you for choosing Flames Pizzeria!`
      return { html, text }
    }
    case "order-receipt": {
      const payload = data as TemplateData["order-receipt"]
      const currency = (amount: number) => `Rs. ${amount.toFixed(2)}`
      const itemsHtml = payload.items
        .map((item) => {
          const customizations = item.customizations?.length
            ? `<div style="margin-top:4px; font-size:12px; color:#666;">Add-ons: ${item.customizations.join(", ")}</div>`
            : ""
          return `
            <tr>
              <td style="padding:8px 0;">
                <div style="font-weight:600;">${item.quantity}× ${item.name}</div>
                <div style="font-size:12px; color:#666;">Base price: ${currency(item.basePrice)}</div>
                ${customizations}
              </td>
              <td style="padding:8px 0; text-align:right; font-weight:600;">${currency(item.lineTotal)}</td>
            </tr>
          `
        })
        .join("")

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 640px; color: #2f2f2f; margin:0 auto;">
          <h1 style="color: #e67e22;">Thank you, ${payload.customerName}!</h1>
          <p>Your order <strong>#${payload.orderId}</strong> has just been delivered. We hope you enjoy every bite.</p>
          <p style="margin:16px 0 0 0; color:#444;">Delivered on <strong>${payload.deliveredAt}</strong>${
            payload.deliveryAddress ? ` to <strong>${payload.deliveryAddress}</strong>` : ""
          }.</p>
          <table style="width:100%; border-collapse:collapse; margin-top:24px;">
            <thead>
              <tr>
                <th style="text-align:left; padding-bottom:8px; border-bottom:1px solid #eee;">Items</th>
                <th style="text-align:right; padding-bottom:8px; border-bottom:1px solid #eee;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding-top:12px; border-top:2px solid #e67e22; font-weight:bold;">Grand Total</td>
                <td style="padding-top:12px; border-top:2px solid #e67e22; font-weight:bold; text-align:right;">${currency(payload.total)}</td>
              </tr>
            </tfoot>
          </table>
          <p style="margin-top:24px;">If everything was delicious, we'd love to hear from you. Reviews help us serve you better!</p>
          <p style="margin-top:16px;">Thanks again for choosing Flames Pizzeria.<br/>— The Flames Team</p>
        </div>
      `
      const textItems = payload.items
        .map((item) => {
          const extras = item.customizations?.length ? ` (Add-ons: ${item.customizations.join(", ")})` : ""
          return `  - ${item.quantity}x ${item.name}${extras} = ${currency(item.lineTotal)}`
        })
        .join("\n")
      const text = `Hi ${payload.customerName},\n\nYour order #${payload.orderId} was delivered on ${payload.deliveredAt}.${
        payload.deliveryAddress ? `\nDelivered to: ${payload.deliveryAddress}` : ""
      }\n\nItems:\n${textItems}\n\nGrand Total: ${currency(payload.total)}\n\nThank you for choosing Flames Pizzeria!`
      return { html, text }
    }
    default: {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 640px; color: #2f2f2f;">
          <p>${(data as { message?: string }).message ?? "Thank you for contacting Flames Pizzeria."}</p>
        </div>
      `
      const text = ((data as { message?: string }).message ?? "Thank you for contacting Flames Pizzeria.")
      return { html, text }
    }
  }
}