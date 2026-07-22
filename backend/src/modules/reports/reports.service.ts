import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ProcessReportDto } from './dto/process-report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async createReport(userId: string, dto: CreateReportDto) {
    if (!dto.bai_dang_bi_bao_cao_id && !dto.nguoi_dung_bi_bao_cao_id) {
      throw new BadRequestException('Vui lòng cung cấp mã bài đăng hoặc mã người dùng bị báo cáo');
    }

    if (dto.bai_dang_bi_bao_cao_id) {
      const asset = await this.prisma.baiDangTaiSan.findUnique({
        where: { bai_dang_id: dto.bai_dang_bi_bao_cao_id },
      });
      if (!asset) throw new NotFoundException('Bài đăng cần báo cáo không tồn tại');
    }

    if (dto.nguoi_dung_bi_bao_cao_id) {
      const user = await this.prisma.nguoiDung.findUnique({
        where: { nguoi_dung_id: dto.nguoi_dung_bi_bao_cao_id },
      });
      if (!user) throw new NotFoundException('Người dùng cần báo cáo không tồn tại');
    }

    const loaiBaoCao = dto.bai_dang_bi_bao_cao_id ? 'BAI_DANG' : 'NGUOI_DUNG';

    return this.prisma.baoCaoViPham.create({
      data: {
        nguoi_bao_cao_id: userId,
        bai_dang_bi_bao_cao_id: dto.bai_dang_bi_bao_cao_id || null,
        nguoi_dung_bi_bao_cao_id: dto.nguoi_dung_bi_bao_cao_id || null,
        loai_bao_cao: loaiBaoCao,
        ly_do_vi_pham: dto.ly_do_bao_cao,
        mo_ta_chi_tiet: dto.mo_ta_chi_tiet || dto.ly_do_bao_cao,
        minh_chung: dto.minh_chung || dto.bang_chung_hinh_anh || null,
        trang_thai_xu_ly: 'CHO_KIEM_DUYET',
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
      },
    });
  }

  async getAllReportsAdmin() {
    return this.prisma.baoCaoViPham.findMany({
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
        await tx.baiDangTaiSan.update({
          where: { bai_dang_id: report.bai_dang_bi_bao_cao_id },
          data: { trang_thai: 'DA_KET_THUC' },
        });
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
