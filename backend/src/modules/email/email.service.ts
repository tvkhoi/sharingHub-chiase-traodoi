import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private logger = new Logger('EmailService');
  private transporter: nodemailer.Transporter;

  constructor() {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    // Auto strip spaces in Gmail App Password (e.g., "fbjh zmjt hnfn pjjs" -> "fbjhzmjthnfnpjjs")
    const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

    if (smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.logger.log(`Initialized Production Gmail SMTP Mailer (${smtpUser})`);
    } else {
      // Fallback transport for development / testing mode
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      this.logger.warn('No SMTP credentials found in env. Email Service running in Dev JSON/Console mode.');
    }
  }

  async sendOtpEmail(toEmail: string, otp: string): Promise<boolean> {
    const mailOptions = {
      from: `"ShareHub Verification" <${process.env.SMTP_FROM || 'no-reply@sharehub.com'}>`,
      to: toEmail,
      subject: `[ShareHub] Mã OTP Xác Thực Email Của Bạn: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 28px; font-weight: 800;">ShareHub</h1>
            <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Nền Tảng Chia Sẻ & Trao Đổi Tài Sản</p>
          </div>

          <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
            <h2 style="color: #111827; font-size: 18px; margin-top: 0;">Xác Thực Địa Chỉ Email Của Bạn</h2>
            <p style="color: #374151; font-size: 14px; line-height: 1.6;">
              Xin chào! Cảm ơn bạn đã sử dụng dịch vụ tại <strong>ShareHub</strong>. Để hoàn tất quy trình xác thực email chính chủ, vui lòng nhập mã OTP xác thực dưới đây:
            </p>
            
            <div style="text-align: center; margin: 28px 0;">
              <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; background: #eef2ff; padding: 12px 28px; border-radius: 12px; border: 2px dashed #6366f1;">
                ${otp}
              </span>
            </div>

            <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0;">
              ⚠️ Mã OTP này có hiệu lực trong <strong>5 phút</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai.
            </p>
          </div>

          <div style="text-align: center; border-top: 1px solid #f3f4f6; color: #9ca3af; font-size: 12px; margin-top: 24px; padding-top: 16px;">
            <p style="margin: 0;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
            <p style="margin: 4px 0 0 0;">© 2026 ShareHub. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP Email successfully sent to ${toEmail} | OTP: ${otp} | MessageId: ${info.messageId || 'DEV'}`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to send OTP Email to ${toEmail}: ${err.message}`);
      return false;
    }
  }
}
