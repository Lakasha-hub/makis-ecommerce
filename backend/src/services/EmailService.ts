import nodemailer from 'nodemailer';
import { IOrder } from '../models/Order';
import { orderConfirmationTemplate } from '../templates/emails/orderConfirmation';
import { orderStatusUpdateTemplate } from '../templates/emails/orderStatusUpdate';
import { userRegistrationTemplate } from '../templates/emails/userRegistration';
import { passwordChangeTemplate } from '../templates/emails/passwordChange';
import { AppError } from '../utils/AppError';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isInitialized = false;

  constructor() {
    this.initTransporter();
  }

  private async initTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      this.isInitialized = true;
      console.log('Nodemailer initialized with custom SMTP settings.');
    } else {
      // Fallback to Ethereal
      console.log('No SMTP configuration found. Generating Ethereal test account...');
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
          },
        });
        this.isInitialized = true;
        console.log(`Ethereal test account generated. User: ${testAccount.user}`);
      } catch (error) {
        // Fallo de servicio externo (Ethereal): no operacional
        throw new AppError('Failed to initialize Ethereal email account', 500, false);
      }
    }
  }

  private async sendMail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      if (!this.isInitialized) {
        // Retry init if called before initialization finished
        await this.initTransporter();
      }
      if (!this.transporter) {
        console.error('EmailService not initialized. Cannot send email to:', to);
        return;
      }
    }

    const from = process.env.EMAIL_FROM || '"Makis E-commerce" <noreply@makis.com>';

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });

      console.log(`Email sent: ${info.messageId}`);
      // Nodemailer options may not always have a host property typed correctly on options object, check ethereal explicitly
      if (info.messageId && process.env.SMTP_HOST === undefined) {
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      // Fallo del servidor SMTP: servicio de terceros no disponible
      throw new AppError('Failed to send email via SMTP', 500, false);
    }
  }

  async sendOrderConfirmation(userEmail: string, userName: string, orderData: IOrder) {
    const html = orderConfirmationTemplate(userName, orderData);
    const orderId = (orderData as any)._id;
    await this.sendMail(userEmail, `Confirmación de Orden #${orderId}`, html);
  }

  async sendOrderStatusUpdate(userEmail: string, userName: string, orderData: IOrder) {
    const html = orderStatusUpdateTemplate(userName, orderData);
    const orderId = (orderData as any)._id;
    await this.sendMail(userEmail, `Actualización de tu Orden #${orderId}`, html);
  }

  async sendUserRegistration(userEmail: string, userName: string) {
    const html = userRegistrationTemplate(userName);
    await this.sendMail(userEmail, '¡Bienvenido a Makis E-commerce!', html);
  }

  async sendPasswordChange(userEmail: string, userName: string, resetLink: string) {
    const html = passwordChangeTemplate(userName, resetLink);
    await this.sendMail(userEmail, 'Recuperación de Contraseña - Makis', html);
  }
}

export const emailService = new EmailService();
