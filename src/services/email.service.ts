// src/services/email.service.ts
import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async (options: EmailOptions): Promise<void> => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'LUXE <noreply@luxe.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
    };

    await transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = async (email: string, firstName: string): Promise<void> => {
    await sendEmail({
        to: email,
        subject: 'Welcome to LUXE',
        html: `
      <h1>Welcome to LUXE, ${firstName}!</h1>
      <p>Thank you for creating an account with us.</p>
      <p>Start shopping our exclusive collection of premium clothing.</p>
      <a href="${process.env.FRONTEND_URL}/shop" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; display: inline-block; margin-top: 16px;">Shop Now</a>
    `,
    });
};

export const sendOrderConfirmationEmail = async (
    email: string,
    orderNumber: string,
    orderDetails: any
): Promise<void> => {
    await sendEmail({
        to: email,
        subject: `Order Confirmed - ${orderNumber}`,
        html: `
      <h1>Order Confirmed!</h1>
      <p>Thank you for your order. Your order number is: <strong>${orderNumber}</strong></p>
      <p>Total: ₹${orderDetails.total}</p>
      <p>We'll notify you when your order ships.</p>
      <a href="${process.env.FRONTEND_URL}/account/orders/${orderNumber}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; display: inline-block; margin-top: 16px;">Track Order</a>
    `,
    });
};

export const sendPasswordResetEmail = async (
    email: string,
    resetToken: string
): Promise<void> => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
        to: email,
        subject: 'Password Reset Request',
        html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; display: inline-block; margin-top: 16px;">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    });
};