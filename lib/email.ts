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
  }
  "password-reset": {
    resetLink: string
  }
  "order-confirmation": {
    orderId: number | string
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

    if (!isConfigured) {
      logMockSend({ to, subject, html })
      return {
        success: true,
        toastTitle: "Request Submitted",
        toastMessage: "Email mocked (RESEND_API_KEY not set)",
        data: { id: "mock-email-id" },
      }
    }

    const transporter = createTransport()

    const info = await transporter.sendMail({
      from: defaultFrom,
      to,
      subject,
      html,
      text,
    })

    return {
      success: true,
      toastTitle: "Email Sent",
      toastMessage: "Confirmation email delivered",
      data: { id: info.messageId },
    }
  } catch (error) {
    console.error("[Email] sendEmail error", error)
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
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 640px; color: #2f2f2f;">
          <h1 style="color: #e67e22;">Hi ${payload.name},</h1>
          <p>Thanks for choosing Flames Pizzeria for your event. We've logged request <strong>#${payload.requestId}</strong>.</p>
          ${payload.eventDate ? `<p><strong>Event date:</strong> ${payload.eventDate}</p>` : ""}
          ${payload.guestCount ? `<p><strong>Guest count:</strong> ${payload.guestCount}</p>` : ""}
          <p>Our catering team will reach out within 24 hours to finalize the menu and logistics.</p>
          <p>Thank you for choosing Flames Pizzeria for your event!</p>
          <br/><br/>
          <p style="margin-top: 24px;">Cheers,<br/>Flames Pizzeria Catering Team</p>
        </div>
      `
      const text = `Hi ${payload.name},\nYour catering request (#${payload.requestId}) is in!$${
        payload.eventDate ? `\nEvent date: ${payload.eventDate}` : ""
      }$${payload.guestCount ? `\nGuest count: ${payload.guestCount}` : ""}\n\nWe'll be in touch soon.\nFlames Pizzeria Catering Team`
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
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 640px; color: #2f2f2f;">
          <h1 style="color: #e67e22;">Order confirmed!</h1>
          <p>Thanks for ordering from Flames Pizzeria. Your order <strong>#${payload.orderId}</strong> is being prepared.</p>
          <p>We'll notify you as soon as it's ready.</p>
        </div>
      `
      const text = `Thanks for ordering from Flames Pizzeria. Your order #${payload.orderId} is confirmed and being prepared.`
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