import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { QueryPaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ProposalsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateProposalDto) {
    // 1. Get asset details
    const asset = await this.prisma.baiDangTaiSan.findUnique({
      where: { bai_dang_id: dto.bai_dang_id },
    });

    if (!asset) {
      throw new NotFoundException('Bài đăng không tồn tại');
    }

    // 2. Rule: Cannot propose to own asset (BRL-014)
    if (asset.chu_so_huu_id === userId) {
      throw new BadRequestException('Bạn không thể gửi đề xuất nhận/trao đổi tài sản của chính mình');
    }

    // 3. Rule: Asset must be KHA_DUNG (BRL-015)
    if (asset.trang_thai !== 'KHA_DUNG') {
      throw new BadRequestException('Bài đăng hiện không ở trạng thái khả dụng');
    }

    // 4. Rule: Requested quantity <= available quantity (BRL-016)
    if (dto.so_luong_yeu_cau > asset.so_luong_kha_dung) {
      throw new BadRequestException(`Số lượng yêu cầu (${dto.so_luong_yeu_cau}) vượt quá số lượng khả dụng (${asset.so_luong_kha_dung})`);
    }

    // 5. Check if active proposal already exists from this user
    const existing = await this.prisma.deXuatGiaoDich.findFirst({
      where: {
        bai_dang_id: dto.bai_dang_id,
        nguoi_gui_id: userId,
        trang_thai: { in: ['CHO_XU_LY', 'DANG_THUONG_LUONG'] },
      },
    });

    if (existing) {
      throw new BadRequestException('Bạn đã có một đề xuất đang chờ xử lý cho bài đăng này');
    }

    return this.prisma.deXuatGiaoDich.create({
      data: {
        bai_dang_id: dto.bai_dang_id,
        nguoi_gui_id: userId,
        so_luong_yeu_cau: dto.so_luong_yeu_cau,
        loi_nhan: dto.loi_nhan || null,
        tai_san_doi_ung: dto.tai_san_doi_ung || null,
        tien_doi_ung: dto.tien_doi_ung || null,
        trang_thai: 'CHO_XU_LY',
      },
      include: {
        bai_dang: true,
        nguoi_gui: {
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

  async getReceivedProposals(userId: string, query?: QueryPaginationDto) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {
      bai_dang: { chu_so_huu_id: userId },
    };

    const [items, total] = await Promise.all([
      this.prisma.deXuatGiaoDich.findMany({
        where,
        skip,
        take: limit,
        orderBy: { ngay_gui: 'desc' },
        include: {
          bai_dang: {
            include: { hinh_anh: true },
          },
          nguoi_gui: {
            select: {
              nguoi_dung_id: true,
              email: true,
              ho_so: true,
              ho_so_uy_tin: true,
            },
          },
        },
      }),
      this.prisma.deXuatGiaoDich.count({ where }),
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

  async getSentProposals(userId: string, query?: QueryPaginationDto) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const where = { nguoi_gui_id: userId };

    const [items, total] = await Promise.all([
      this.prisma.deXuatGiaoDich.findMany({
        where,
        skip,
        take: limit,
        orderBy: { ngay_gui: 'desc' },
        include: {
          bai_dang: {
            include: {
              hinh_anh: true,
              chu_so_huu: {
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
      this.prisma.deXuatGiaoDich.count({ where }),
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

  async findOne(id: string) {
    const proposal = await this.prisma.deXuatGiaoDich.findUnique({
      where: { de_xuat_id: id },
      include: {
        bai_dang: {
          include: {
            hinh_anh: true,
            chu_so_huu: {
              select: {
                nguoi_dung_id: true,
                email: true,
                ho_so: true,
                ho_so_uy_tin: true,
              },
            },
          },
        },
        nguoi_gui: {
          select: {
            nguoi_dung_id: true,
            email: true,
            ho_so: true,
            ho_so_uy_tin: true,
          },
        },
      },
    });

    if (!proposal) {
      throw new NotFoundException('Không tìm thấy đề xuất giao dịch');
    }

    return proposal;
  }

  // ACCEPT PROPOSAL (ACID TRANSACTION)
  async acceptProposal(id: string, userId: string) {
    const proposal = await this.findOne(id);

    // Only owner of the asset can accept (UC3.2)
    if (proposal.bai_dang.chu_so_huu_id !== userId) {
      throw new ForbiddenException('Chỉ chủ sở hữu tài sản mới có quyền chấp nhận đề xuất');
    }

    if (proposal.trang_thai !== 'CHO_XU_LY' && proposal.trang_thai !== 'DANG_THUONG_LUONG') {
      throw new BadRequestException('Đề xuất không ở trạng thái hợp lệ để chấp nhận');
    }

    return this.prisma.$transaction(async (tx) => {
      // Re-fetch asset with transaction lock
      const asset = await tx.baiDangTaiSan.findUnique({
        where: { bai_dang_id: proposal.bai_dang_id },
      });

      if (asset.so_luong_kha_dung < proposal.so_luong_yeu_cau) {
        throw new BadRequestException('Số lượng khả dụng không đủ để hoàn tất chấp nhận đề xuất');
      }

      // Update Asset quantities
      const newKhaDung = asset.so_luong_kha_dung - proposal.so_luong_yeu_cau;
      const newGiuCho = asset.so_luong_giu_cho + proposal.so_luong_yeu_cau;
      const newTrangThai = newKhaDung === 0 ? 'TAM_HET_KHA_DUNG' : asset.trang_thai;

      await tx.baiDangTaiSan.update({
        where: { bai_dang_id: asset.bai_dang_id },
        data: {
          so_luong_kha_dung: newKhaDung,
          so_luong_giu_cho: newGiuCho,
          trang_thai: newTrangThai,
        },
      });

      // Update Proposal status
      await tx.deXuatGiaoDich.update({
        where: { de_xuat_id: id },
        data: { trang_thai: 'DA_CHAP_NHAN' },
      });

      // Create Transaction
      const giaoDich = await tx.giaoDich.create({
        data: {
          de_xuat_id: id,
          nguoi_so_huu_id: asset.chu_so_huu_id,
          nguoi_tiep_nhan_id: proposal.nguoi_gui_id,
          so_luong_giao_dich: proposal.so_luong_yeu_cau,
          dia_diem_ban_giao: asset.dia_diem,
          trang_thai: 'CHO_BAN_GIAO',
          xac_nhan_nguoi_so_huu: false,
          xac_nhan_nguoi_tiep_nhan: false,
        },
      });

      return {
        message: 'Đã chấp nhận đề xuất và khởi tạo giao dịch mới',
        giao_dich: giaoDich,
      };
    });
  }

  async rejectProposal(id: string, userId: string, lyDoTuChoi?: string) {
    const proposal = await this.findOne(id);

    if (proposal.bai_dang.chu_so_huu_id !== userId) {
      throw new ForbiddenException('Chỉ chủ sở hữu tài sản mới có quyền từ chối đề xuất');
    }

    if (proposal.trang_thai !== 'CHO_XU_LY' && proposal.trang_thai !== 'DANG_THUONG_LUONG') {
      throw new BadRequestException('Đề xuất không ở trạng thái hợp lệ để từ chối');
    }

    await this.prisma.deXuatGiaoDich.update({
      where: { de_xuat_id: id },
      data: {
        trang_thai: 'TU_CHOI',
        ly_do_tu_choi: lyDoTuChoi || 'Chủ tài sản từ chối đề xuất',
      },
    });

    return { message: 'Đã từ chối đề xuất giao dịch' };
  }

  async cancelProposal(id: string, userId: string) {
    const proposal = await this.findOne(id);

    if (proposal.nguoi_gui_id !== userId) {
      throw new ForbiddenException('Chỉ người gửi đề xuất mới có quyền hủy');
    }

    if (proposal.trang_thai !== 'CHO_XU_LY' && proposal.trang_thai !== 'DANG_THUONG_LUONG') {
      throw new BadRequestException('Đề xuất đã được xử lý hoặc đã kết thúc, không thể hủy');
    }

    await this.prisma.deXuatGiaoDich.update({
      where: { de_xuat_id: id },
      data: { trang_thai: 'DA_HUY' },
    });

    return { message: 'Đã hủy đề xuất giao dịch' };
  }

  async startNegotiation(id: string, userId: string) {
    const proposal = await this.findOne(id);

    const isOwner = proposal.bai_dang.chu_so_huu_id === userId;
    const isSender = proposal.nguoi_gui_id === userId;

    if (!isOwner && !isSender) {
      throw new ForbiddenException('Bạn không tham gia vào đề xuất này');
    }

    if (proposal.trang_thai === 'CHO_XU_LY') {
      await this.prisma.deXuatGiaoDich.update({
        where: { de_xuat_id: id },
        data: { trang_thai: 'DANG_THUONG_LUONG' },
      });
    }

    return { message: 'Chuyển sang trạng thái đang thương lượng' };
  }

  async sendMessage(deXuatId: string, userId: string, noiDung: string) {
    const proposal = await this.findOne(deXuatId);

    const isOwner = proposal.bai_dang.chu_so_huu_id === userId;
    const isSender = proposal.nguoi_gui_id === userId;

    if (!isOwner && !isSender) {
      throw new ForbiddenException('Bạn không có quyền gửi tin nhắn trong thương lượng này');
    }

    return this.prisma.tinNhanThuongLuong.create({
      data: {
        de_xuat_id: deXuatId,
        nguoi_gui_id: userId,
        noi_dung: noiDung,
        trang_thai: 'DA_GUI',
      },
      include: {
        nguoi_gui: {
          select: {
            nguoi_dung_id: true,
            email: true,
            ho_so: true,
          },
        },
      },
    });
  }

  async getMessages(deXuatId: string, userId: string) {
    const proposal = await this.findOne(deXuatId);

    const isOwner = proposal.bai_dang.chu_so_huu_id === userId;
    const isSender = proposal.nguoi_gui_id === userId;

    if (!isOwner && !isSender) {
      throw new ForbiddenException('Bạn không có quyền xem tin nhắn trong thương lượng này');
    }

    return this.prisma.tinNhanThuongLuong.findMany({
      where: { de_xuat_id: deXuatId },
      orderBy: { thoi_gian_gui: 'asc' },
      include: {
        nguoi_gui: {
          select: {
            nguoi_dung_id: true,
            email: true,
            ho_so: true,
          },
        },
      },
    });
  }
}
