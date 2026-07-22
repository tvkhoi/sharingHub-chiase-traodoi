import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAllMyTransactions(userId: string) {
    return this.prisma.giaoDich.findMany({
      where: {
        OR: [
          { nguoi_so_huu_id: userId },
          { nguoi_tiep_nhan_id: userId },
        ],
      },
      orderBy: { ngay_tao: 'desc' },
      include: {
        de_xuat: {
          include: {
            bai_dang: {
              include: { hinh_anh: true },
            },
          },
        },
        nguoi_so_huu: {
          select: {
            nguoi_dung_id: true,
            email: true,
            ho_so: true,
            ho_so_uy_tin: true,
          },
        },
        nguoi_tiep_nhan: {
          select: {
            nguoi_dung_id: true,
            email: true,
            ho_so: true,
            ho_so_uy_tin: true,
          },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const tx = await this.prisma.giaoDich.findUnique({
      where: { giao_dich_id: id },
      include: {
        de_xuat: {
          include: {
            bai_dang: {
              include: { hinh_anh: true, danh_muc: true },
            },
          },
        },
        nguoi_so_huu: {
          select: {
            nguoi_dung_id: true,
            email: true,
            ho_so: true,
            ho_so_uy_tin: true,
          },
        },
        nguoi_tiep_nhan: {
          select: {
            nguoi_dung_id: true,
            email: true,
            ho_so: true,
            ho_so_uy_tin: true,
          },
        },
        danh_gia: true,
      },
    });

    if (!tx) {
      throw new NotFoundException('Giao dịch không tồn tại');
    }

    if (tx.nguoi_so_huu_id !== userId && tx.nguoi_tiep_nhan_id !== userId) {
      throw new ForbiddenException('Bạn không tham gia vào giao dịch này');
    }

    return tx;
  }

  // CONFIRM TRANSACTION (ACID TRANSACTION)
  async confirmTransaction(id: string, userId: string) {
    const txData = await this.findOne(id, userId);

    if (txData.trang_thai === 'HOAN_TAT' || txData.trang_thai === 'DA_HUY') {
      throw new BadRequestException('Giao dịch đã kết thúc, không thể xác nhận thêm');
    }

    const isOwner = txData.nguoi_so_huu_id === userId;
    const isReceiver = txData.nguoi_tiep_nhan_id === userId;

    return this.prisma.$transaction(async (tx) => {
      let xacNhanSoHuu = txData.xac_nhan_nguoi_so_huu;
      let xacNhanTiepNhan = txData.xac_nhan_nguoi_tiep_nhan;

      if (isOwner) xacNhanSoHuu = true;
      if (isReceiver) xacNhanTiepNhan = true;

      // Both sides confirmed -> Transition to HOAN_TAT (8.4)
      if (xacNhanSoHuu && xacNhanTiepNhan) {
        const updatedGiaoDich = await tx.giaoDich.update({
          where: { giao_dich_id: id },
          data: {
            xac_nhan_nguoi_so_huu: true,
            xac_nhan_nguoi_tiep_nhan: true,
            trang_thai: 'HOAN_TAT',
          },
        });

        // Update Asset quantities (BRL-019)
        const asset = await tx.baiDangTaiSan.findUnique({
          where: { bai_dang_id: txData.de_xuat.bai_dang_id },
        });

        const newGiuCho = Math.max(0, asset.so_luong_giu_cho - txData.so_luong_giao_dich);
        const newDaPhanPhoi = asset.so_luong_da_phan_phoi + txData.so_luong_giao_dich;
        let newTrangThai = asset.trang_thai;

        if (asset.so_luong_kha_dung === 0 && newGiuCho === 0) {
          newTrangThai = 'DA_KET_THUC';
        }

        await tx.baiDangTaiSan.update({
          where: { bai_dang_id: txData.de_xuat.bai_dang_id },
          data: {
            so_luong_giu_cho: newGiuCho,
            so_luong_da_phan_phoi: newDaPhanPhoi,
            trang_thai: newTrangThai,
          },
        });

        // Increment completed transactions count for both participants (DSD 4.3 so_giao_dich_hoan_tat)
        await tx.hoSoUyTin.updateMany({
          where: {
            nguoi_dung_id: { in: [txData.nguoi_so_huu_id, txData.nguoi_tiep_nhan_id] },
          },
          data: {
            so_giao_dich_hoan_tat: { increment: 1 },
          },
        });

        return {
          message: 'Cả hai bên đã xác nhận! Giao dịch hoàn tất thành công.',
          giao_dich: updatedGiaoDich,
        };
      } else {
        // Only 1 side confirmed
        const updatedGiaoDich = await tx.giaoDich.update({
          where: { giao_dich_id: id },
          data: {
            xac_nhan_nguoi_so_huu: xacNhanSoHuu,
            xac_nhan_nguoi_tiep_nhan: xacNhanTiepNhan,
            trang_thai: 'CHO_BEN_CON_LAI_XAC_NHAN',
          },
        });

        return {
          message: 'Đã lưu xác nhận của bạn. Đang chờ bên còn lại xác nhận.',
          giao_dich: updatedGiaoDich,
        };
      }
    });
  }

  // CANCEL TRANSACTION (ACID TRANSACTION 8.5)
  async cancelTransaction(id: string, userId: string, lyDo?: string) {
    const txData = await this.findOne(id, userId);

    if (!lyDo || !lyDo.trim()) {
      throw new BadRequestException('Vui lòng cung cấp lý do hủy giao dịch');
    }

    if (txData.trang_thai === 'HOAN_TAT' || txData.trang_thai === 'DA_HUY') {
      throw new BadRequestException('Giao dịch đã kết thúc, không thể thực hiện hủy');
    }

    const cleanReason = lyDo.trim();

    return this.prisma.$transaction(async (tx) => {
      // 1. Update Transaction status
      const updatedGiaoDich = await tx.giaoDich.update({
        where: { giao_dich_id: id },
        data: {
          trang_thai: 'DA_HUY',
          ly_do_huy: cleanReason,
        },
      });

      // 2. Synchronize associated Proposal status to DA_HUY
      if (txData.de_xuat_id) {
        await tx.deXuatGiaoDich.update({
          where: { de_xuat_id: txData.de_xuat_id },
          data: {
            trang_thai: 'DA_HUY',
            ly_do_tu_choi: cleanReason,
          },
        });
      }

      // 3. Release locked quantity back to available quantity
      const asset = await tx.baiDangTaiSan.findUnique({
        where: { bai_dang_id: txData.de_xuat.bai_dang_id },
      });

      if (asset) {
        const newGiuCho = Math.max(0, asset.so_luong_giu_cho - txData.so_luong_giao_dich);
        const newKhaDung = asset.so_luong_kha_dung + txData.so_luong_giao_dich;
        const newTrangThai = newKhaDung > 0 ? 'KHA_DUNG' : asset.trang_thai;

        await tx.baiDangTaiSan.update({
          where: { bai_dang_id: txData.de_xuat.bai_dang_id },
          data: {
            so_luong_giu_cho: newGiuCho,
            so_luong_kha_dung: newKhaDung,
            trang_thai: newTrangThai,
          },
        });
      }

      return {
        message: 'Đã hủy giao dịch thành công và hoàn trả số lượng tài sản về trạng thái khả dụng.',
        giao_dich: updatedGiaoDich,
      };
    });
  }
}
