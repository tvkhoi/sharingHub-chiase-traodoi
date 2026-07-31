import { Injectable, BadRequestException, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ProcessReportDto } from './dto/process-report.dto';
import { QueryPaginationDto } from '../../common/dto/pagination.dto';
import { NegotiationGateway } from '../negotiation/negotiation.gateway';

@Injectable()
export class ReportsService implements OnModuleInit {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private prisma: PrismaService,
    private negotiationGateway: NegotiationGateway,
  ) {}

  async onModuleInit() {
    await this.backfillMissingReportUserIds();
  }

  async backfillMissingReportUserIds() {
    try {
      const nullUserReports = await this.prisma.baoCaoViPham.findMany({
        where: {
          nguoi_dung_bi_bao_cao_id: null,
          bai_dang_bi_bao_cao_id: { not: null },
        },
        select: {
          bao_cao_id: true,
          bai_dang_bi_bao_cao_id: true,
        },
      });

      if (nullUserReports.length > 0) {
        this.logger.log(`Tự động cập nhật ${nullUserReports.length} bản ghi báo cáo bị thiếu nguoi_dung_bi_bao_cao_id...`);
        let updatedCount = 0;

        for (const report of nullUserReports) {
          if (report.bai_dang_bi_bao_cao_id) {
            const asset = await this.prisma.baiDangTaiSan.findUnique({
              where: { bai_dang_id: report.bai_dang_bi_bao_cao_id },
              select: { chu_so_huu_id: true },
            });

            if (asset && asset.chu_so_huu_id) {
              await this.prisma.baoCaoViPham.update({
                where: { bao_cao_id: report.bao_cao_id },
                data: { nguoi_dung_bi_bao_cao_id: asset.chu_so_huu_id },
              });
              updatedCount++;
            }
          }
        }
        this.logger.log(`✅ Đã tự động cập nhật xong ${updatedCount}/${nullUserReports.length} bản ghi báo cáo vi phạm trong CSDL!`);
      }
    } catch (error) {
      this.logger.error('Lỗi khi tự động backfill nguoi_dung_bi_bao_cao_id:', error);
    }
  }

  async createReport(userId: string, dto: CreateReportDto) {
    if (dto.bai_dang_bi_bao_cao_id) {
      const asset = await this.prisma.baiDangTaiSan.findUnique({
        where: { bai_dang_id: dto.bai_dang_bi_bao_cao_id },
      });
      if (!asset) throw new NotFoundException('Bài đăng cần báo cáo không tồn tại');

      const existingReport = await this.prisma.baoCaoViPham.findFirst({
        where: {
          nguoi_bao_cao_id: userId,
          bai_dang_bi_bao_cao_id: dto.bai_dang_bi_bao_cao_id,
        },
      });
      if (existingReport) {
        throw new BadRequestException('Bạn đã gửi báo cáo cho bài viết này trước đó. Vui lòng chờ Quản trị viên xử lý.');
      }
    }

    if (dto.nguoi_dung_bi_bao_cao_id) {
      const user = await this.prisma.nguoiDung.findUnique({
        where: { nguoi_dung_id: dto.nguoi_dung_bi_bao_cao_id },
      });
      if (!user) throw new NotFoundException('Người dùng cần báo cáo không tồn tại');

      const existingReport = await this.prisma.baoCaoViPham.findFirst({
        where: {
          nguoi_bao_cao_id: userId,
          nguoi_dung_bi_bao_cao_id: dto.nguoi_dung_bi_bao_cao_id,
        },
      });
      if (existingReport) {
        throw new BadRequestException('Bạn đã gửi báo cáo cho người dùng này trước đó. Vui lòng chờ Quản trị viên xử lý.');
      }
    }

    const loaiBaoCao = dto.loai_bao_cao
      ? dto.loai_bao_cao
      : dto.bai_dang_bi_bao_cao_id
      ? 'BAI_DANG'
      : dto.nguoi_dung_bi_bao_cao_id
      ? 'NGUOI_DUNG'
      : 'HE_THONG';

    let targetUserId = dto.nguoi_dung_bi_bao_cao_id || null;
    if (dto.bai_dang_bi_bao_cao_id && !targetUserId) {
      const asset = await this.prisma.baiDangTaiSan.findUnique({
        where: { bai_dang_id: dto.bai_dang_bi_bao_cao_id },
      });
      if (asset) {
        targetUserId = asset.chu_so_huu_id;
      }
    }

    const minhChungListToCreate: any[] = [];
    if (dto.danh_sach_minh_chung && dto.danh_sach_minh_chung.length > 0) {
      dto.danh_sach_minh_chung.forEach((mc, index) => {
        if (mc.duong_dan_tep) {
          const fileName = mc.ten_tep || mc.duong_dan_tep.substring(mc.duong_dan_tep.lastIndexOf('/') + 1) || 'Tệp đính kèm';
          const fileExt = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.') + 1) : '';

          minhChungListToCreate.push({
            duong_dan_tep: mc.duong_dan_tep,
            ten_tep: fileName,
            loai_tep: mc.loai_tep || (fileExt ? `image/${fileExt}` : 'image/jpeg'),
            kich_thuoc_tep: mc.kich_thuoc_tep ? BigInt(mc.kich_thuoc_tep) : null,
            thu_tu_hien_thi: mc.thu_tu_hien_thi || index + 1,
          });
        }
      });
    } else {
      const singleUrl = dto.minh_chung || dto.bang_chung_hinh_anh;
      if (singleUrl) {
        const urls = singleUrl.split(',').map((u) => u.trim()).filter(Boolean);
        urls.forEach((url, index) => {
          const fileName = url.substring(url.lastIndexOf('/') + 1) || 'Tệp đính kèm';
          const fileExt = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.') + 1) : '';

          minhChungListToCreate.push({
            duong_dan_tep: url,
            ten_tep: fileName,
            loai_tep: fileExt ? `image/${fileExt}` : 'image/jpeg',
            thu_tu_hien_thi: index + 1,
          });
        });
      }
    }

    const legacyMinhChung = dto.minh_chung || dto.bang_chung_hinh_anh || (minhChungListToCreate.length > 0 ? minhChungListToCreate[0].duong_dan_tep : null);

    return this.prisma.baoCaoViPham.create({
      data: {
        nguoi_bao_cao_id: userId,
        bai_dang_bi_bao_cao_id: dto.bai_dang_bi_bao_cao_id || null,
        nguoi_dung_bi_bao_cao_id: targetUserId,
        loai_bao_cao: loaiBaoCao,
        ly_do_vi_pham: dto.ly_do_bao_cao,
        mo_ta_chi_tiet: dto.mo_ta_chi_tiet || dto.ly_do_bao_cao,
        minh_chung: legacyMinhChung,
        trang_thai_xu_ly: 'CHO_KIEM_DUYET',
        ...(minhChungListToCreate.length > 0 && {
          danh_sach_minh_chung: {
            create: minhChungListToCreate,
          },
        }),
      },
      include: {
        nguoi_bao_cao: {
          select: {
            nguoi_dung_id: true,
            email: true,
            ho_so: true,
          },
        },
        bai_dang_bi_bao_cao: true,
        nguoi_dung_bi_bao_cao: {
          select: {
            nguoi_dung_id: true,
            email: true,
            ho_so: true,
          },
        },
        danh_sach_minh_chung: {
          orderBy: { thu_tu_hien_thi: 'asc' },
        },
      },
    });
  }

  async getAllReportsAdmin(query?: QueryPaginationDto) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.baoCaoViPham.findMany({
        skip,
        take: limit,
        orderBy: { ngay_bao_cao: 'desc' },
        include: {
          nguoi_bao_cao: {
            select: {
              nguoi_dung_id: true,
              email: true,
              ho_so: true,
            },
          },
          bai_dang_bi_bao_cao: true,
          nguoi_dung_bi_bao_cao: {
            select: {
              nguoi_dung_id: true,
              email: true,
              ho_so: true,
            },
          },
          danh_sach_minh_chung: {
            orderBy: { thu_tu_hien_thi: 'asc' },
          },
          bien_phap: {
            include: {
              quan_tri_vien: {
                select: {
                  nguoi_dung_id: true,
                  email: true,
                  ho_so: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.baoCaoViPham.count(),
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

  async getReportByIdAdmin(id: string) {
    const report = await this.prisma.baoCaoViPham.findUnique({
      where: { bao_cao_id: id },
      include: {
        nguoi_bao_cao: {
          select: {
            nguoi_dung_id: true,
            email: true,
            ho_so: true,
          },
        },
        bai_dang_bi_bao_cao: true,
        nguoi_dung_bi_bao_cao: {
          select: {
            nguoi_dung_id: true,
            email: true,
            ho_so: true,
          },
        },
        danh_sach_minh_chung: {
          orderBy: { thu_tu_hien_thi: 'asc' },
        },
        bien_phap: {
          include: {
            quan_tri_vien: {
              select: {
                nguoi_dung_id: true,
                email: true,
                ho_so: true,
              },
            },
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Báo cáo không tồn tại');
    }

    return report;
  }

  async processReportAdmin(reportId: string, adminId: string, dto: ProcessReportDto) {
    const report = await this.getReportByIdAdmin(reportId);

    if (report.trang_thai_xu_ly !== 'CHO_KIEM_DUYET') {
      throw new BadRequestException('Báo cáo này đã được xử lý trước đó');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create penalty action record
      const action = await tx.bienPhapXuLy.create({
        data: {
          bao_cao_id: reportId,
          quan_tri_vien_id: adminId,
          loai_bien_phap: dto.loai_bien_phap,
          noi_dung_xu_ly: dto.ghi_chu_xu_ly || 'Đã thực thi biện pháp xử lý',
        },
      });

      // 2. Apply action penalty if required
      if (dto.loai_bien_phap === 'AN_BAI_DANG' && report.bai_dang_bi_bao_cao_id) {
        const updatedAsset = await tx.baiDangTaiSan.update({
          where: { bai_dang_id: report.bai_dang_bi_bao_cao_id },
          data: { trang_thai: 'DA_KET_THUC' },
        });

        try {
          this.negotiationGateway.sendNotificationToUser(updatedAsset.chu_so_huu_id, {
            type: 'ASSET_MODERATED',
            title: 'Bài đăng bị tạm khóa',
            message: `Bài đăng "${updatedAsset.ten_tai_san}" của bạn đã bị Quản trị viên khóa do vi phạm quy định cộng đồng.`,
            link: '/my-assets',
            payload: { assetId: updatedAsset.bai_dang_id },
          });
        } catch (err) {
          console.error('Lỗi gửi push notification khóa bài đăng:', err);
        }
      } else if (dto.loai_bien_phap === 'KHOI_PHUC_BAI_DANG' && report.bai_dang_bi_bao_cao_id) {
        const updatedAsset = await tx.baiDangTaiSan.update({
          where: { bai_dang_id: report.bai_dang_bi_bao_cao_id },
          data: { trang_thai: 'KHA_DUNG' },
        });

        try {
          this.negotiationGateway.sendNotificationToUser(updatedAsset.chu_so_huu_id, {
            type: 'ASSET_MODERATED',
            title: 'Bài đăng đã được khôi phục! 🎉',
            message: `Kháng cáo thành công! Bài đăng "${updatedAsset.ten_tai_san}" của bạn đã được mở lại ở trạng thái Khả dụng.`,
            link: `/assets/${updatedAsset.bai_dang_id}`,
            payload: { assetId: updatedAsset.bai_dang_id },
          });
        } catch (err) {
          console.error('Lỗi gửi push notification khôi phục bài đăng:', err);
        }
      } else if (dto.loai_bien_phap === 'KHOA_TAI_KHOAN') {
        const targetUserId =
          report.nguoi_dung_bi_bao_cao_id ||
          (report.bai_dang_bi_bao_cao_id
            ? (
                await tx.baiDangTaiSan.findUnique({
                  where: { bai_dang_id: report.bai_dang_bi_bao_cao_id },
                })
              )?.chu_so_huu_id
            : null);

        if (targetUserId) {
          await tx.nguoiDung.update({
            where: { nguoi_dung_id: targetUserId },
            data: { trang_thai: 'BI_KHOA' },
          });
        }
      }

      // 3. Update report status
      const newReportStatus = dto.loai_bien_phap === 'KHONG_VI_PHAM' ? 'TU_CHOI' : 'DA_XU_LY';

      const updatedReport = await tx.baoCaoViPham.update({
        where: { bao_cao_id: reportId },
        data: { trang_thai_xu_ly: newReportStatus },
      });

      return {
        message: 'Đã xử lý báo cáo vi phạm thành công',
        bao_cao: updatedReport,
        bien_phap: action,
      };
    });
  }
}
