import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private otpStore = new Map<string, { otp: string; expiresAt: number }>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async sendOtp(email: string) {
    if (!email || !email.trim()) {
      throw new BadRequestException('Vui lòng cung cấp địa chỉ email');
    }
    const cleanEmail = email.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new BadRequestException('Email không đúng định dạng hợp lệ (Ví dụ: name@example.com)');
    }

    // Check existing email
    const existingUser = await this.prisma.nguoiDung.findUnique({
      where: { email: cleanEmail },
    });
    if (existingUser) {
      throw new BadRequestException('Email này đã được sử dụng. Vui lòng sử dụng thông tin khác.');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    this.otpStore.set(cleanEmail, { otp, expiresAt });

    // Send real email via Nodemailer
    await this.emailService.sendOtpEmail(cleanEmail, otp);

    return {
      message: 'Mã OTP xác thực 6 số đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư!',
      otpSimulated: otp,
    };
  }

  async verifyOtp(email: string, otp: string) {
    if (!email || !otp) {
      throw new BadRequestException('Vui lòng cung cấp đầy đủ Email và mã OTP');
    }
    const cleanEmail = email.trim().toLowerCase();
    const record = this.otpStore.get(cleanEmail);

    if (!record) {
      throw new BadRequestException('Chưa gửi mã OTP hoặc mã OTP không hợp lệ');
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(cleanEmail);
      throw new BadRequestException('Mã OTP đã hết hạn. Vui lòng lấy lại mã mới');
    }

    if (record.otp !== otp.trim()) {
      throw new BadRequestException('Mã OTP nhập vào không chính xác');
    }

    return { message: 'Xác thực Email thành công!', verified: true };
  }

  async register(dto: RegisterDto) {
    // 0. Mandatory OTP Code Verification for Email
    if (!dto.otp || !dto.otp.trim()) {
      throw new BadRequestException('Mã OTP xác thực Email là bắt buộc. Vui lòng lấy mã OTP từ Email!');
    }

    const cleanEmail = dto.email.trim().toLowerCase();
    const record = this.otpStore.get(cleanEmail);

    if (!record) {
      throw new BadRequestException('Email chưa nhận mã OTP hoặc mã không tồn tại. Vui lòng ấn Gửi mã OTP!');
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(cleanEmail);
      throw new BadRequestException('Mã OTP xác thực Email đã hết hạn. Vui lòng lấy mã OTP mới!');
    }

    if (record.otp !== dto.otp.trim()) {
      throw new BadRequestException('Mã OTP xác thực Email không chính xác. Vui lòng kiểm tra lại!');
    }

    // OTP Code is verified! Remove OTP from store so it cannot be reused
    this.otpStore.delete(cleanEmail);

    // 1. Validate password confirmation if provided (5e.1)
    if (dto.xac_nhan_mat_khau && dto.mat_khau !== dto.xac_nhan_mat_khau) {
      throw new BadRequestException('Mật khẩu và xác nhận mật khẩu không trùng khớp. Vui lòng nhập lại.');
    }

    // 1. Check duplicate email (5e)
    const existingEmail = await this.prisma.nguoiDung.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new BadRequestException('Email này đã được sử dụng. Vui lòng sử dụng thông tin khác.');
    }

    // 2. Check duplicate phone if provided (5e)
    if (dto.so_dien_thoai) {
      const existingPhone = await this.prisma.nguoiDung.findUnique({
        where: { so_dien_thoai: dto.so_dien_thoai },
      });
      if (existingPhone) {
        throw new BadRequestException('Số điện thoại này đã được sử dụng. Vui lòng sử dụng thông tin khác.');
      }
    }

    // 3. Hash password
    const matKhauHash = await bcrypt.hash(dto.mat_khau, 10);

    // 4. Transaction: Create user + HoSoThanhVien + HoSoUyTin (8.1)
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.nguoiDung.create({
        data: {
          email: dto.email,
          so_dien_thoai: dto.so_dien_thoai || null,
          mat_khau_hash: matKhauHash,
          vai_tro: 'THANH_VIEN',
          trang_thai: 'HOAT_DONG',
        },
      });

      await tx.hoSoThanhVien.create({
        data: {
          nguoi_dung_id: user.nguoi_dung_id,
          ho_ten: dto.ho_ten,
          dia_chi: dto.dia_chi || null,
        },
      });

      await tx.hoSoUyTin.create({
        data: {
          nguoi_dung_id: user.nguoi_dung_id,
          diem_trung_binh: 0.00,
          tong_so_danh_gia: 0,
          so_giao_dich_hoan_tat: 0,
        },
      });

      return user;
    });

    const token = this.generateToken(result.nguoi_dung_id, result.email, result.vai_tro);

    return {
      message: 'Đăng ký tài khoản thành công',
      user: {
        nguoi_dung_id: result.nguoi_dung_id,
        email: result.email,
        vai_tro: result.vai_tro,
      },
      access_token: token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.nguoiDung.findFirst({
      where: {
        OR: [
          { email: dto.tai_khoan },
          { so_dien_thoai: dto.tai_khoan },
        ],
      },
      include: {
        ho_so: true,
        ho_so_uy_tin: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email/Số điện thoại hoặc mật khẩu không chính xác');
    }

    if (user.trang_thai === 'BI_KHOA') {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa do vi phạm quy định');
    }

    const isMatch = await bcrypt.compare(dto.mat_khau, user.mat_khau_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Email/Số điện thoại hoặc mật khẩu không chính xác');
    }

    const token = this.generateToken(user.nguoi_dung_id, user.email, user.vai_tro);

    return {
      message: 'Đăng nhập thành công',
      user: {
        nguoi_dung_id: user.nguoi_dung_id,
        email: user.email,
        vai_tro: user.vai_tro,
        ho_so: user.ho_so,
        ho_so_uy_tin: user.ho_so_uy_tin,
      },
      access_token: token,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.nguoiDung.findUnique({
      where: { nguoi_dung_id: userId },
      select: {
        nguoi_dung_id: true,
        email: true,
        so_dien_thoai: true,
        vai_tro: true,
        trang_thai: true,
        ngay_tao: true,
        ho_so: true,
        ho_so_uy_tin: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    return user;
  }

  private generateToken(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, vai_tro: role };
    return this.jwtService.sign(payload);
  }
}
