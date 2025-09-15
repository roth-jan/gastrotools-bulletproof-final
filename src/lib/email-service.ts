import { Resend } from 'resend';
import { getTranslation } from './translations';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private defaultFrom = 'GastroTools <noreply@gastrotools.de>';

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.log('📧 Email service not configured - would send:', options.subject);
        return true; // Return success in development
      }

      await resend.emails.send({
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      console.log(`📧 Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      console.error('📧 Email send failed:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, language: 'de' | 'en' = 'de'): Promise<boolean> {
    const resetUrl = `${process.env.NEXT_PUBLIC_API_URL}/reset-password?token=${resetToken}`;

    const subject = `GastroTools - ${getTranslation('auth.reset_password.subject', language)}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">${getTranslation('auth.reset_password.title', language)}</h1>
        <p>${getTranslation('auth.reset_password.request_message', language)}</p>
        <p>${getTranslation('auth.reset_password.click_link', language)}</p>
        <a href="${resetUrl}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          ${getTranslation('auth.reset_password.button', language)}
        </a>
        <p>${getTranslation('auth.reset_password.validity', language)}</p>
        <p>${getTranslation('auth.reset_password.ignore_message', language)}</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px;">
          GastroTools - ${getTranslation('email.footer.tagline', language)}<br>
          ${getTranslation('email.footer.auto_generated', language)}
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: subject,
      html: html
    });
  }

  async sendContactEmail(data: { name: string; email: string; subject: string; message: string }): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Neue Kontaktanfrage</h1>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>E-Mail:</strong> ${data.email}</p>
        <p><strong>Betreff:</strong> ${data.subject}</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3>Nachricht:</h3>
          <p style="white-space: pre-wrap;">${data.message}</p>
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px;">
          GastroTools Kontaktformular<br>
          Automatisch generiert von gastrotools.de
        </p>
      </div>
    `;

    return this.sendEmail({
      to: 'info@gastrotools.de', // Your business email
      subject: `Kontaktanfrage: ${data.subject}`,
      html: html
    });
  }
}

export const emailService = new EmailService();

export async function sendLeadNotification(leadData: any): Promise<boolean> {
  // Stub implementation for lead notifications
  console.log('Would send lead notification:', leadData)
  return true
}