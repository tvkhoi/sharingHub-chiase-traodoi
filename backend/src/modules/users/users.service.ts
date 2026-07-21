import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(nguoi_dung_id: string) {
    const user = await this.prisma.nguoiDung.findUnique({
      where: { nguoi_dung_id },
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
      throw new NotFoundException('Người dùng không tồn tại');
    }

    return user;
  }

  async updateProfile(nguoi_dung_id: string, dto: UpdateProfileDto) {
    const hoSo = await this.prisma.hoSoThanhVien.findUnique({
      where: { nguoi_dung_id },
    });

    if (!hoSo) {
      throw new NotFoundException('Hồ sơ thành viên không tồn tại');
    }

    const updated = await this.prisma.hoSoThanhVien.update({
      where: { nguoi_dung_id },
      data: dto,
    });

    return {
      message: 'Cập nhật hồ sơ thành công',
      ho_so: updated,
    };
  }

  async getReputationProfile(nguoi_dung_id: string) {
    const uyTin = await this.prisma.hoSoUyTin.findUnique({
      where: { nguoi_dung_id },
      include: {
        nguoi_dung: {
          select: {
            nguoi_dung_id: true,
            email: true,
            ngay_tao: true,
            ho_so: {
              select: {
                ho_ten: true,
                anh_dai_dien: true,
                dia_chi: true,
                mo_ta_ca_nhan: true,
              },
            },
            danh_gia_da_nhan: {
              orderBy: { thoi_gian_danh_gia: 'desc' },
              take: 20,
              include: {
                nguoi_danh_gia: {
                  select: {
                    nguoi_dung_id: true,
                    ho_so: {
                      select: {
                        ho_ten: true,
                        anh_dai_dien: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!uyTin) {
      throw new NotFoundException('Không tìm thấy hồ sơ uy tín của người dùng');
    }

    return uyTin;
  }
}
