import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { NegotiationGateway } from '../negotiation/negotiation.gateway';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private negotiationGateway: NegotiationGateway,
  ) {}

  async createReview(userId: string, dto: CreateReviewDto) {
    // 1. Fetch transaction
    const tx = await this.prisma.giaoDich.findUnique({
      where: { giao_dich_id: dto.giao_dich_id },
    });

    if (!tx) {
      throw new NotFoundException('Giao dịch không tồn tại');
    }

    // 2. Rule: Only completed transaction can be reviewed (BRL-022)
    if (tx.trang_thai !== 'HOAN_TAT') {
      throw new BadRequestException('Chỉ có thể đánh giá sau khi giao dịch đã hoàn tất');
    }

    // 3. User must be participant
    const isOwner = tx.nguoi_so_huu_id === userId;
    const isReceiver = tx.nguoi_tiep_nhan_id === userId;

    if (!isOwner && !isReceiver) {
      throw new BadRequestException('Bạn không tham gia vào giao dịch này');
    }

    const targetUserId = isOwner ? tx.nguoi_tiep_nhan_id : tx.nguoi_so_huu_id;

    // 4. Rule: One review per transaction per user (BRL-023)
    const existing = await this.prisma.danhGia.findFirst({
      where: {
        giao_dich_id: dto.giao_dich_id,
        nguoi_danh_gia_id: userId,
      },
    });

    if (existing) {
      throw new BadRequestException('Bạn đã thực hiện đánh giá cho giao dịch này rồi');
    }

    // 5. Transaction: Create review + recalculate target user reputation profile (8.6)
    return this.prisma.$transaction(async (prismaTx) => {
      const review = await prismaTx.danhGia.create({
        data: {
          giao_dich_id: dto.giao_dich_id,
          nguoi_danh_gia_id: userId,
          nguoi_duoc_danh_gia_id: targetUserId,
          diem_sao: dto.diem_sao,
          nhan_xet: dto.nhan_xet || null,
        },
      });

      // Recalculate average star rating & update count (DSD 4.3)
      const reviewsReceived = await prismaTx.danhGia.findMany({
        where: { nguoi_duoc_danh_gia_id: targetUserId },
      });

      const totalCount = reviewsReceived.length;
      const sumStars = reviewsReceived.reduce((acc, r) => acc + r.diem_sao, 0);
      const avgRating = Number((sumStars / totalCount).toFixed(2));

      await prismaTx.hoSoUyTin.update({
        where: { nguoi_dung_id: targetUserId },
        data: {
          tong_so_danh_gia: totalCount,
          diem_trung_binh: avgRating,
        },
      });

      const result = {
        message: 'Đã gửi đánh giá thành công',
        danh_gia: review,
      };

      try {
        const reviewer = await prismaTx.nguoiDung.findUnique({
          where: { nguoi_dung_id: userId },
          include: { ho_so: true },
        });
        const reviewerName = reviewer?.ho_so?.ho_ten || 'Một thành viên';

        this.negotiationGateway.sendNotificationToUser(targetUserId, {
          type: 'NEW_REVIEW',
          title: 'Đánh giá uy tín mới! ⭐',
          message: `${reviewerName} vừa gửi cho bạn đánh giá ${dto.diem_sao}/5 sao: "${dto.nhan_xet || 'Giao dịch tuyệt vời!'}"`,
          link: `/profile/${targetUserId}`,
          payload: { reviewId: review.danh_gia_id },
        });
      } catch (err) {
        console.error('Lỗi gửi push notification đánh giá mới:', err);
      }

      return result;
    });
  }

  async getUserReviews(userId: string) {
    return this.prisma.danhGia.findMany({
      where: { nguoi_duoc_danh_gia_id: userId },
      orderBy: { thoi_gian_danh_gia: 'desc' },
      include: {
        nguoi_danh_gia: {
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
