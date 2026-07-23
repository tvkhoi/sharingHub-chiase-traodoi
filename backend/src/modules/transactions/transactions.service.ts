import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryPaginationDto } from '../../common/dto/pagination.dto';
import { NegotiationGateway } from '../negotiation/negotiation.gateway';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private negotiationGateway: NegotiationGateway,
  ) {}

  async findAllMyTransactions(userId: string, query?: QueryPaginationDto) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { nguoi_so_huu_id: userId },
        { nguoi_tiep_nhan_id: userId },
      ],
    };

    const [items, total] = await Promise.all([
      this.prisma.giaoDich.findMany({
        where,
        skip,
        take: limit,
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
      }),
      this.prisma.giaoDich.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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

        // Notify both sides that transaction is completed
        try {
          const partnerId = isOwner ? txData.nguoi_tiep_nhan_id : txData.nguoi_so_huu_id;
          const assetTitle = txData.de_xuat?.bai_dang?.ten_tai_san || 'tài sản';

          this.negotiationGateway.sendNotificationToUser(partnerId, {
            type: 'TRANSACTION_UPDATED',
            title: 'Giao dịch hoàn tất! 🎉',
            message: `Giao dịch bàn giao "${assetTitle}" đã hoàn tất thành công. Đừng quên để lại đánh giá uy tín nhé!`,
            link: '/transactions',
            payload: { transactionId: id },
          });

          this.negotiationGateway.sendNotificationToUser(userId, {
            type: 'TRANSACTION_UPDATED',
            title: 'Giao dịch hoàn tất! 🎉',
            message: `Giao dịch bàn giao "${assetTitle}" đã hoàn tất thành công. Đừng quên để lại đánh giá uy tín nhé!`,
            link: '/transactions',
            payload: { transactionId: id },
          });
        } catch (err) {
          console.error('Lỗi gửi push notification hoàn tất giao dịch:', err);
        }

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

        // Send push notification to the partner waiting for confirmation
        try {
          const partnerId = isOwner ? txData.nguoi_tiep_nhan_id : txData.nguoi_so_huu_id;
          const actorName = isOwner ? (txData.nguoi_so_huu?.ho_so?.ho_ten || 'Chủ tài sản') : (txData.nguoi_tiep_nhan?.ho_so?.ho_ten || 'Người nhận');
          const assetTitle = txData.de_xuat?.bai_dang?.ten_tai_san || 'tài sản';

          this.negotiationGateway.sendNotificationToUser(partnerId, {
            type: 'TRANSACTION_UPDATED',
            title: 'Xác nhận bàn giao mới',
            message: `${actorName} vừa xác nhận bàn giao tài sản "${assetTitle}". Vui lòng kiểm tra và xác nhận phần của bạn.`,
            link: '/transactions',
            payload: { transactionId: id },
          });
        } catch (err) {
          console.error('Lỗi gửi push notification chờ xác nhận giao dịch:', err);
        }

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
    const isOwner = txData.nguoi_so_huu_id === userId;

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

      // Send push notification to partner
      try {
        const partnerId = isOwner ? txData.nguoi_tiep_nhan_id : txData.nguoi_so_huu_id;
        const actorName = isOwner ? (txData.nguoi_so_huu?.ho_so?.ho_ten || 'Đối tác') : (txData.nguoi_tiep_nhan?.ho_so?.ho_ten || 'Đối tác');
        const assetTitle = txData.de_xuat?.bai_dang?.ten_tai_san || 'tài sản';

        this.negotiationGateway.sendNotificationToUser(partnerId, {
          type: 'TRANSACTION_UPDATED',
          title: 'Giao dịch đã bị hủy',
          message: `${actorName} đã hủy giao dịch bài đăng "${assetTitle}". Lý do: "${cleanReason}".`,
          link: '/transactions',
          payload: { transactionId: id },
        });
      } catch (err) {
        console.error('Lỗi gửi push notification hủy giao dịch:', err);
      }

      return {
        message: 'Đã hủy giao dịch thành công và hoàn trả số lượng tài sản về trạng thái khả dụng.',
        giao_dich: updatedGiaoDich,
      };
    });
  }
}
