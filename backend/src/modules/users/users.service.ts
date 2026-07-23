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
    const { ho_ten, anh_dai_dien, dia_chi, mo_ta_ca_nhan, so_dien_thoai } = dto;

    const hoSo = await this.prisma.hoSoThanhVien.findUnique({
      where: { nguoi_dung_id },
    });

    if (!hoSo) {
      throw new NotFoundException('Hồ sơ thành viên không tồn tại');
    }

    const hoSoData: any = {};
    if (ho_ten !== undefined) hoSoData.ho_ten = ho_ten;
    if (anh_dai_dien !== undefined) hoSoData.anh_dai_dien = anh_dai_dien;
    if (dia_chi !== undefined) hoSoData.dia_chi = dia_chi;
    if (mo_ta_ca_nhan !== undefined) hoSoData.mo_ta_ca_nhan = mo_ta_ca_nhan;

    const updatedHoSo = await this.prisma.hoSoThanhVien.update({
      where: { nguoi_dung_id },
      data: hoSoData,
    });

    if (so_dien_thoai !== undefined) {
      await this.prisma.nguoiDung.update({
        where: { nguoi_dung_id },
        data: { so_dien_thoai },
      });
    }

    const updatedUser = await this.getProfile(nguoi_dung_id);

    return {
      message: 'Cập nhật hồ sơ thành công',
      user: updatedUser,
      ho_so: updatedHoSo,
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
