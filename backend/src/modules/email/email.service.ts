import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

/**
 * Service xử lý gửi email xác thực và thông báo hệ thống
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
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
      this.logger.log(`Khởi tạo SMTP Transport thành công [${smtpHost}:${smtpPort}] (${smtpUser})`);
    } else {
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
      this.logger.warn('Chưa cấu hình tài khoản SMTP. Chế độ giả lập (Dev Console) được bật.');
    }
  }

  /**
   * Gửi mã OTP xác thực email 6 chữ số
   * @param toEmail Email người nhận
   * @param otp Mã OTP ngẫu nhiên
   */
  async sendOtpEmail(toEmail: string, otp: string): Promise<boolean> {
    const brevoApiKey = process.env.BREVO_API_KEY;

    // 1. Gửi qua Brevo API nếu được cấu hình (phù hợp môi trường cloud như Render)
    if (brevoApiKey && brevoApiKey.trim()) {
      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': brevoApiKey.trim(),
          },
          body: JSON.stringify({
            sender: { name: 'ShareHub Verification', email: process.env.SMTP_USER || 'no-reply@sharehub.com' },
            to: [{ email: toEmail }],
            subject: `[ShareHub] Mã OTP Xác Thực Email Của Bạn: ${otp}`,
            htmlContent: this.getOtpTemplate(otp),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          this.logger.log(`Đã gửi email OTP thành công tới ${toEmail} qua Brevo API (MessageId: ${data.messageId})`);
          return true;
        }

        const errText = await response.text();
        this.logger.error(`Gửi email qua Brevo API thất bại: ${errText}`);
      } catch (err) {
        this.logger.error(`Lỗi khi gọi Brevo API: ${err.message}`);
      }
    }

    // 2. Gửi qua SMTP thông thường (phù hợp môi trường local/VPS)
    const fromAddress = process.env.SMTP_USER || 'no-reply@sharehub.com';

    const mailOptions = {
      from: `"ShareHub Verification" <${fromAddress}>`,
      to: toEmail,
      subject: `[ShareHub] Mã OTP Xác Thực Email Của Bạn: ${otp}`,
      html: this.getOtpTemplate(otp),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Đã gửi email OTP thành công tới ${toEmail} qua SMTP (MessageId: ${info.messageId})`);
      return true;
    } catch (err) {
      this.logger.error(`Gửi email SMTP tới ${toEmail} thất bại: ${err.message}`);
      return false;
    }
  }

  /**
   * Tạo giao diện HTML cho Email chứa mã OTP
   */
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
            Xin chào! Cảm ơn bạn đã đăng ký tài khoản tại <strong>ShareHub</strong>. Để hoàn tất xác thực email chính chủ, vui lòng nhập mã OTP dưới đây:
          </p>
          
          <div style="text-align: center; margin: 28px 0;">
            <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; background: #eef2ff; padding: 12px 28px; border-radius: 12px; border: 2px dashed #6366f1;">
              ${otp}
            </span>
          </div>

          <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0;">
            ⚠️ Mã OTP có hiệu lực trong vòng <strong>5 phút</strong>. Vui lòng bảo mật và không chia sẻ mã này.
          </p>
        </div>

        <div style="text-align: center; border-top: 1px solid #f3f4f6; color: #9ca3af; font-size: 12px; margin-top: 24px; padding-top: 16px;">
          <p style="margin: 0;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
          <p style="margin: 4px 0 0 0;">© 2026 ShareHub. All rights reserved.</p>
        </div>
      </div>
    `;
  }
}
