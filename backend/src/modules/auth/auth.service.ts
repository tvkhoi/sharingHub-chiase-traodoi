import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // 0. Validate password confirmation if provided
    if (dto.xac_nhan_mat_khau && dto.mat_khau !== dto.xac_nhan_mat_khau) {
      throw new BadRequestException('Mật khẩu nhập lại không khớp với mật khẩu đã nhập');
    }

    // 1. Check duplicate email
    const existingEmail = await this.prisma.nguoiDung.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new BadRequestException('Email này đã được sử dụng');
    }

    // 2. Check duplicate phone if provided
    if (dto.so_dien_thoai) {
      const existingPhone = await this.prisma.nguoiDung.findUnique({
        where: { so_dien_thoai: dto.so_dien_thoai },
      });
      if (existingPhone) {
        throw new BadRequestException('Số điện thoại này đã được sử dụng');
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
