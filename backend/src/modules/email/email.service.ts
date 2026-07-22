import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private logger = new Logger('EmailService');
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

    if (smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.logger.log(`Initialized Production Gmail SMTP Mailer (${smtpUser})`);
    } else {
      this.logger.warn('No SMTP credentials found in env.');
    }
  }

  async sendOtpEmail(toEmail: string, otp: string): Promise<boolean> {
    const resendApiKey = process.env.RESEND_API_KEY;

    // 1. Ưu tiên gửi qua Resend HTTP API (Cổng 443 - Không bao giờ bị Render chặn)
    if (resendApiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey.trim()}`,
          },
          body: JSON.stringify({
            from: 'ShareHub OTP <onboarding@resend.dev>',
            to: [toEmail],
            subject: `[ShareHub] Mã OTP Xác Thực Email Của Bạn: ${otp}`,
            html: this.getOtpTemplate(otp),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          this.logger.log(`[Resend HTTP] OTP Email successfully sent to ${toEmail} | MessageId: ${data.id}`);
          return true;
        } else {
          const errData = await response.text();
          this.logger.error(`[Resend HTTP] Failed: ${errData}`);
        }
      } catch (err) {
        this.logger.error(`[Resend HTTP] Exception: ${err.message}`);
      }
    }

    // 2. Fallback sang Gmail SMTP (cho môi trường local / VPS)
    if (this.transporter) {
      const mailOptions = {
        from: `"ShareHub Verification" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: `[ShareHub] Mã OTP Xác Thực Email Của Bạn: ${otp}`,
        html: this.getOtpTemplate(otp),
      };

      try {
        const sendPromise = this.transporter.sendMail(mailOptions);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('SMTP send mail timeout (10s)')), 10000)
        );

        const info = (await Promise.race([sendPromise, timeoutPromise])) as any;
        this.logger.log(`[Gmail SMTP] OTP Email sent to ${toEmail} | MessageId: ${info?.messageId}`);
        return true;
      } catch (err) {
        this.logger.error(`[Gmail SMTP] Failed: ${err.message}`);
        return false;
      }
    }

    this.logger.error('No email sending mechanism available (Neither RESEND_API_KEY nor SMTP configured)');
    return false;
  }

  private getOtpTemplate(otp: string): string {
    return `
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
    `;
  }
}

