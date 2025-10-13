import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;

interface EmailResult {
  success: boolean;
  toastTitle: string;
  toastMessage: string;
  data?: { id: string };
}

// Mock email service for development
const mockEmailService = {
  sendEmail: async (params: any): Promise<EmailResult> => {
    console.log('[Email Mock] Would send email:', {
      to: params.to,
      subject: params.subject
    });
    return {
      success: true,
      toastTitle: 'Request Submitted',
      toastMessage: 'We would send an email in production',
      data: { id: 'mock-email-id' }
    };
  }
};

// Real email service for production
const realEmailService = (key: string) => {
  if (!key) {
    console.error('Resend API key is missing');
    throw new Error('Email service not configured');
  }

  const resend = new Resend(key);

  return {
    sendEmail: async (params: any): Promise<EmailResult> => {
      try {
        const { error, data } = await resend.emails.send(params);
        
        if (error) {
          console.error('Email failed:', error);
          return {
            success: false,
            toastTitle: 'Submission Error',
            toastMessage: 'Failed to send confirmation email'
          };
        }

        return {
          success: true,
          toastTitle: 'Request Submitted',
          toastMessage: 'We\'ve received your request and sent a confirmation',
          data
        };
      } catch (err) {
        console.error('Email error:', err);
        return {
          success: false,
          toastTitle: 'Service Error',
          toastMessage: 'Failed to process your request'
        };
      }
    }
  };
};

const emailService = process.env.NODE_ENV === 'development' && !apiKey
  ? mockEmailService
  : realEmailService(apiKey!);

type EmailTemplate = 
  | 'catering-confirmation' 
  | 'password-reset'
  | 'order-confirmation';

export async function sendEmail({
  to,
  subject,
  template,
  data
}: {
  to: string;
  subject: string;
  template: EmailTemplate;
  data: Record<string, any>;
}): Promise<EmailResult> {
  try {
    const html = getEmailTemplate(template, data);
    return await emailService.sendEmail({
      from: 'no-reply@flamespizzeria.com',
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('Email processing failed:', error);
    return {
      success: false,
      toastTitle: 'System Error',
      toastMessage: 'Failed to process your request. Please try again later.'
    };
  }
}

function getEmailTemplate(template: EmailTemplate, data: Record<string, any>) {
  switch (template) {
    case 'catering-confirmation':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h1 style="color: #e67e22;">Hi ${data.name},</h1>
          <p>Your catering request (#${data.requestId}) has been received!</p>
          <p>We'll contact you shortly to confirm details.</p>
        </div>
      `;
    
    case 'password-reset':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h1 style="color: #e67e22;">Password Reset</h1>
          <p>Click the button below to reset your password:</p>
          <a href="${data.resetLink}" 
             style="display: inline-block; padding: 10px 20px; background-color: #e67e22; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Reset Password
          </a>
          <p>This link expires in 1 hour.</p>
        </div>
      `;
      
    case 'order-confirmation':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h1 style="color: #e67e22;">Order Confirmation</h1>
          <p>Thank you for your order (#${data.orderId})!</p>
        </div>
      `;
      
    default:
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <p>${data.message || 'Thank you for your request'}</p>
        </div>
      `;
  }
}