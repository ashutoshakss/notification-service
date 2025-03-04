import sgMail from '@sendgrid/mail';
import { EmailProvider } from './EmailProvider';
import { config } from '../../../config';

export class SendGridProvider implements EmailProvider {
  constructor() {
    sgMail.setApiKey(config.providers.email.sendgrid.apiKey);
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
    templateId?: string,
    templateData?: Record<string, any>
  ): Promise<{ success: boolean; providerId?: string; error?: string }> {
    try {
      const msg = {
        to,
        from: {
          email: config.providers.email.sendgrid.fromEmail,
          name: config.providers.email.sendgrid.fromName
        },
        subject,
        text,
        html: html || text
      };

      // If a SendGrid template ID is provided, use it
      if (templateId) {
        Object.assign(msg, {
          templateId,
          dynamicTemplateData: templateData || {}
        });
      }

      const response = await sgMail.send(msg);
      
      return {
        success: true,
        providerId: response[0]?.headers['x-message-id'] || undefined
      };
    } catch (error) {
      console.error('SendGrid error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email via SendGrid'
      };
    }
  }
} 