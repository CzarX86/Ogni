import { log } from '../utils/logger';

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailRequest {
  to: EmailRecipient | EmailRecipient[];
  template: EmailTemplate;
  from?: EmailRecipient;
}

export class EmailService {
  private static instance: EmailService;
  private apiKey: string;
  private baseURL: string;

  private constructor() {
    // In production, this would come from environment variables
    this.apiKey = process.env.REACT_APP_EMAIL_API_KEY || 'email-api-key';
    this.baseURL = process.env.REACT_APP_EMAIL_API_BASE_URL || 'https://api.emailprovider.com/v1';
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(orderId: string, customerEmail: string, customerName: string, orderDetails: any): Promise<void> {
    try {
      const template = this.getOrderConfirmationTemplate(orderId, customerName, orderDetails);

      await this.sendEmail({
        to: { email: customerEmail, name: customerName },
        template
      });

      log.info('Order confirmation email sent', { orderId, customerEmail });
    } catch (error) {
      log.error('Failed to send order confirmation email', { error, orderId });
      throw new Error('Failed to send confirmation email');
    }
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(orderId: string, customerEmail: string, customerName: string, newStatus: string, orderDetails: any): Promise<void> {
    try {
      const template = this.getOrderStatusUpdateTemplate(orderId, customerName, newStatus, orderDetails);

      await this.sendEmail({
        to: { email: customerEmail, name: customerName },
        template
      });

      log.info('Order status update email sent', { orderId, customerEmail, newStatus });
    } catch (error) {
      log.error('Failed to send order status update email', { error, orderId });
      throw new Error('Failed to send status update email');
    }
  }

  /**
   * Send shipping confirmation email
   */
  async sendShippingConfirmation(orderId: string, customerEmail: string, customerName: string, trackingInfo: any): Promise<void> {
    try {
      const template = this.getShippingConfirmationTemplate(orderId, customerName, trackingInfo);

      await this.sendEmail({
        to: { email: customerEmail, name: customerName },
        template
      });

      log.info('Shipping confirmation email sent', { orderId, customerEmail });
    } catch (error) {
      log.error('Failed to send shipping confirmation email', { error, orderId });
      throw new Error('Failed to send shipping confirmation email');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, resetToken: string): Promise<void> {
    try {
      const template = this.getPasswordResetTemplate(resetToken);

      await this.sendEmail({
        to: { email },
        template
      });

      log.info('Password reset email sent', { email });
    } catch (error) {
      log.error('Failed to send password reset email', { error, email });
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send welcome email for new users
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      const template = this.getWelcomeTemplate(name);

      await this.sendEmail({
        to: { email, name },
        template
      });

      log.info('Welcome email sent', { email });
    } catch (error) {
      log.error('Failed to send welcome email', { error, email });
      throw new Error('Failed to send welcome email');
    }
  }

  /**
   * Send promotional email
   */
  async sendPromotionalEmail(recipients: EmailRecipient[], subject: string, content: string): Promise<void> {
    try {
      const template = this.getPromotionalTemplate(subject, content);

      await this.sendEmail({
        to: recipients,
        template
      });

      log.info('Promotional email sent', { recipientCount: recipients.length });
    } catch (error) {
      log.error('Failed to send promotional email', { error });
      throw new Error('Failed to send promotional email');
    }
  }

  /**
   * Send newsletter
   */
  async sendNewsletter(recipients: EmailRecipient[], newsletterContent: any): Promise<void> {
    try {
      const template = this.getNewsletterTemplate(newsletterContent);

      await this.sendEmail({
        to: recipients,
        template
      });

      log.info('Newsletter sent', { recipientCount: recipients.length });
    } catch (error) {
      log.error('Failed to send newsletter', { error });
      throw new Error('Failed to send newsletter');
    }
  }

  /**
   * Generic email sending method
   */
  private async sendEmail(request: SendEmailRequest): Promise<void> {
    // In a real implementation, this would call an email service API
    // For now, we'll simulate the email sending

    const recipients = Array.isArray(request.to) ? request.to : [request.to];

    // Simulate API call
    console.log('Sending email:', {
      to: recipients,
      subject: request.template.subject,
      from: request.from || { email: 'noreply@ogni.com', name: 'Ogni' }
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // In production, this would be:
    /*
    const response = await fetch(`${this.baseURL}/emails`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: recipients,
        from: request.from || { email: 'noreply@ogni.com', name: 'Ogni' },
        subject: request.template.subject,
        html: request.template.html,
        text: request.template.text
      })
    });

    if (!response.ok) {
      throw new Error('Email service error');
    }
    */
  }

  /**
   * Email templates
   */
  private getOrderConfirmationTemplate(orderId: string, customerName: string, orderDetails: any): EmailTemplate {
    return {
      subject: `Order Confirmation - ${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Order Confirmation</h1>
          <p>Hi ${customerName},</p>
          <p>Thank you for your order! Your order #${orderId} has been successfully placed.</p>
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Total:</strong> R$ ${orderDetails.total?.toFixed(2)}</p>
            <p><strong>Status:</strong> ${orderDetails.status}</p>
          </div>
          <p>You'll receive another email when your order ships.</p>
          <p>Best regards,<br>The Ogni Team</p>
        </div>
      `,
      text: `Order Confirmation - ${orderId}\n\nHi ${customerName},\n\nThank you for your order! Your order #${orderId} has been successfully placed.\n\nOrder Details:\nOrder ID: ${orderId}\nTotal: R$ ${orderDetails.total?.toFixed(2)}\nStatus: ${orderDetails.status}\n\nYou'll receive another email when your order ships.\n\nBest regards,\nThe Ogni Team`
    };
  }

  private getOrderStatusUpdateTemplate(orderId: string, customerName: string, newStatus: string, orderDetails: any): EmailTemplate {
    return {
      subject: `Order Update - ${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Order Status Update</h1>
          <p>Hi ${customerName},</p>
          <p>Your order #${orderId} status has been updated to: <strong>${newStatus}</strong></p>
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>New Status:</strong> ${newStatus}</p>
          </div>
          <p>Best regards,<br>The Ogni Team</p>
        </div>
      `,
      text: `Order Status Update - ${orderId}\n\nHi ${customerName},\n\nYour order #${orderId} status has been updated to: ${newStatus}\n\nOrder Details:\nOrder ID: ${orderId}\nNew Status: ${newStatus}\n\nBest regards,\nThe Ogni Team`
    };
  }

  private getShippingConfirmationTemplate(orderId: string, customerName: string, trackingInfo: any): EmailTemplate {
    return {
      subject: `Your Order Has Shipped - ${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Your Order Has Shipped!</h1>
          <p>Hi ${customerName},</p>
          <p>Great news! Your order #${orderId} has been shipped and is on its way to you.</p>
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <h3>Shipping Details</h3>
            <p><strong>Tracking Number:</strong> ${trackingInfo.trackingNumber}</p>
            <p><strong>Carrier:</strong> ${trackingInfo.carrier}</p>
            <p><strong>Estimated Delivery:</strong> ${trackingInfo.estimatedDelivery}</p>
          </div>
          <p>You can track your package using the information above.</p>
          <p>Best regards,<br>The Ogni Team</p>
        </div>
      `,
      text: `Your Order Has Shipped - ${orderId}\n\nHi ${customerName},\n\nGreat news! Your order #${orderId} has been shipped and is on its way to you.\n\nShipping Details:\nTracking Number: ${trackingInfo.trackingNumber}\nCarrier: ${trackingInfo.carrier}\nEstimated Delivery: ${trackingInfo.estimatedDelivery}\n\nYou can track your package using the information above.\n\nBest regards,\nThe Ogni Team`
    };
  }

  private getPasswordResetTemplate(resetToken: string): EmailTemplate {
    const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;

    return {
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Password Reset</h1>
          <p>You requested a password reset for your Ogni account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" style="display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p>If you didn't request this reset, please ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
          <p>Best regards,<br>The Ogni Team</p>
        </div>
      `,
      text: `Password Reset\n\nYou requested a password reset for your Ogni account.\n\nReset your password here: ${resetLink}\n\nIf you didn't request this reset, please ignore this email.\nThis link will expire in 1 hour.\n\nBest regards,\nThe Ogni Team`
    };
  }

  private getWelcomeTemplate(name: string): EmailTemplate {
    return {
      subject: 'Welcome to Ogni!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to Ogni, ${name}!</h1>
          <p>Thank you for joining our community. We're excited to have you with us!</p>
          <p>Start exploring our products and enjoy shopping with us.</p>
          <a href="${window.location.origin}" style="display: inline-block; background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Start Shopping</a>
          <p>Best regards,<br>The Ogni Team</p>
        </div>
      `,
      text: `Welcome to Ogni, ${name}!\n\nThank you for joining our community. We're excited to have you with us!\n\nStart exploring our products: ${window.location.origin}\n\nBest regards,\nThe Ogni Team`
    };
  }

  private getPromotionalTemplate(subject: string, content: string): EmailTemplate {
    return {
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">${subject}</h1>
          <div>${content}</div>
          <p>Best regards,<br>The Ogni Team</p>
        </div>
      `,
      text: `${subject}\n\n${content}\n\nBest regards,\nThe Ogni Team`
    };
  }

  private getNewsletterTemplate(newsletterContent: any): EmailTemplate {
    return {
      subject: newsletterContent.subject || 'Ogni Newsletter',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">${newsletterContent.title || 'Ogni Newsletter'}</h1>
          <div>${newsletterContent.content}</div>
          <p>Best regards,<br>The Ogni Team</p>
        </div>
      `,
      text: `${newsletterContent.title || 'Ogni Newsletter'}\n\n${newsletterContent.content}\n\nBest regards,\nThe Ogni Team`
    };
  }
}