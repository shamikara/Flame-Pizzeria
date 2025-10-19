import nodemailer from "nodemailer"

type EmailResult = {
  success: boolean
  toastTitle: string
  toastMessage: string
  data?: { id: string }
  errorCode?: string
}

type TemplateName = "catering-confirmation" | "password-reset" | "order-confirmation"

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