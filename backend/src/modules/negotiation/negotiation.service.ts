import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NegotiationService {
  constructor(private prisma: PrismaService) {}

  async getMessages(proposalId: string, userId: string) {
    const proposal = await this.prisma.deXuatGiaoDich.findUnique({
      where: { de_xuat_id: proposalId },
      include: { bai_dang: true },
    });

    if (!proposal) {
      throw new NotFoundException('Không tìm thấy đề xuất');
    }

    const isOwner = proposal.bai_dang.chu_so_huu_id === userId;
    const isSender = proposal.nguoi_gui_id === userId;

    if (!isOwner && !isSender) {
      throw new ForbiddenException('Bạn không phải người tham gia thương lượng này');
    }

    return this.prisma.tinNhanThuongLuong.findMany({
      where: { de_xuat_id: proposalId },
      orderBy: { thoi_gian_gui: 'asc' },
      include: {
        nguoi_gui: {
          select: {
            nguoi_dung_id: true,
            email: true,
            ho_so: {
              select: {
                ho_ten: true,
                anh_dai_dien: true,
              },
            },
          },
        },
      },
    });
  }

  async createMessage(proposalId: string, userId: string, noiDung: string) {
    const proposal = await this.prisma.deXuatGiaoDich.findUnique({
      where: { de_xuat_id: proposalId },
      include: { bai_dang: true },
    });

    if (!proposal) {
      throw new NotFoundException('Không tìm thấy đề xuất');
    }

    const isOwner = proposal.bai_dang.chu_so_huu_id === userId;
    const isSender = proposal.nguoi_gui_id === userId;

    if (!isOwner && !isSender) {
      throw new ForbiddenException('Bạn không có quyền gửi tin nhắn trong thương lượng này');
    }

    // Auto switch to DANG_THUONG_LUONG if CHO_XU_LY
    if (proposal.trang_thai === 'CHO_XU_LY') {
      await this.prisma.deXuatGiaoDich.update({
        where: { de_xuat_id: proposalId },
        data: { trang_thai: 'DANG_THUONG_LUONG' },
      });
    }

    return this.prisma.tinNhanThuongLuong.create({
      data: {
        de_xuat_id: proposalId,
        nguoi_gui_id: userId,
        noi_dung: noiDung,
        trang_thai: 'DA_GUI',
      },
      include: {
        nguoi_gui: {
          select: {
            nguoi_dung_id: true,
            email: true,
            ho_so: {
              select: {
                ho_ten: true,
                anh_dai_dien: true,
              },
            },
          },
        },
      },
    });
  }
}
