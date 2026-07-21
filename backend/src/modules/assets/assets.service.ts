import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { QueryAssetDto } from './dto/query-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateAssetDto) {
    // 1. Check Category existence
    const category = await this.prisma.danhMucTaiSan.findUnique({
      where: { danh_muc_id: dto.danh_muc_id },
    });
    if (!category) {
      throw new BadRequestException('Danh mục tài sản không tồn tại');
    }

    // 2. Validate TRAO_DOI form requirement (BRL-011)
    if (dto.hinh_thuc_chia_se === 'TRAO_DOI' && !dto.hinh_thuc_trao_doi) {
      throw new BadRequestException('Vui lòng chọn hình thức trao đổi (tài sản hoặc tiền)');
    }

    // 3. Create Asset + Images in transaction
    const asset = await this.prisma.$transaction(async (tx) => {
      const baiDang = await tx.baiDangTaiSan.create({
        data: {
          chu_so_huu_id: userId,
          danh_muc_id: dto.danh_muc_id,
          ten_tai_san: dto.ten_tai_san,
          mo_ta_hien_trang: dto.mo_ta_hien_trang,
          so_luong_tong: dto.so_luong_tong,
          so_luong_kha_dung: dto.so_luong_tong,
          so_luong_giu_cho: 0,
          so_luong_da_phan_phoi: 0,
          hinh_thuc_chia_se: dto.hinh_thuc_chia_se,
          hinh_thuc_trao_doi: dto.hinh_thuc_chia_se === 'TRAO_DOI' ? dto.hinh_thuc_trao_doi : null,
          dia_diem: dto.dia_diem,
          trang_thai: 'KHA_DUNG',
        },
      });

      if (dto.hinh_anh && dto.hinh_anh.length > 0) {
        await tx.hinhAnhTaiSan.createMany({
          data: dto.hinh_anh.map((url, idx) => ({
            bai_dang_id: baiDang.bai_dang_id,
            duong_dan_anh: url,
            thu_tu_hien_thi: idx + 1,
          })),
        });
      }

      return baiDang;
    });

    return this.findOne(asset.bai_dang_id);
  }

  async findAll(query: QueryAssetDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.trang_thai) {
      where.trang_thai = query.trang_thai;
    } else {
      where.trang_thai = 'KHA_DUNG';
    }

    if (query.danh_muc_id) {
      where.danh_muc_id = query.danh_muc_id;
    }

    if (query.hinh_thuc_chia_se) {
      where.hinh_thuc_chia_se = query.hinh_thuc_chia_se;
    }

    if (query.search) {
      where.OR = [
        { ten_tai_san: { contains: query.search, mode: 'insensitive' } },
        { mo_ta_hien_trang: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.baiDangTaiSan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { ngay_tao: 'desc' },
        include: {
          hinh_anh: true,
          danh_muc: true,
          chu_so_huu: {
            select: {
              nguoi_dung_id: true,
              email: true,
              ho_so: true,
              ho_so_uy_tin: true,
            },
          },
        },
      }),
      this.prisma.baiDangTaiSan.count({ where }),
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

  async findMyAssets(userId: string) {
    return this.prisma.baiDangTaiSan.findMany({
      where: { chu_so_huu_id: userId },
      orderBy: { ngay_tao: 'desc' },
      include: {
        hinh_anh: true,
        danh_muc: true,
      },
    });
  }

  async findOne(id: string) {
    const asset = await this.prisma.baiDangTaiSan.findUnique({
      where: { bai_dang_id: id },
      include: {
        hinh_anh: true,
        danh_muc: true,
        chu_so_huu: {
          select: {
            nguoi_dung_id: true,
            email: true,
            ho_so: true,
            ho_so_uy_tin: true,
          },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Không tìm thấy bài đăng tài sản');
    }

    return asset;
  }

  async update(id: string, userId: string, dto: UpdateAssetDto) {
    const asset = await this.findOne(id);

    if (asset.chu_so_huu_id !== userId) {
      throw new ForbiddenException('Bạn không phải chủ sở hữu bài đăng này');
    }

    // Check if asset is locked in active transactions
    const activeTx = await this.prisma.giaoDich.findFirst({
      where: {
        de_xuat: { bai_dang_id: id },
        trang_thai: { in: ['CHO_BAN_GIAO', 'CHO_BEN_CON_LAI_XAC_NHAN'] },
      },
    });

    if (activeTx) {
      throw new BadRequestException('Bài đăng đang trong giao dịch active, không thể sửa thông tin nhạy cảm');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.baiDangTaiSan.update({
        where: { bai_dang_id: id },
        data: {
          danh_muc_id: dto.danh_muc_id || asset.danh_muc_id,
          ten_tai_san: dto.ten_tai_san || asset.ten_tai_san,
          mo_ta_hien_trang: dto.mo_ta_hien_trang || asset.mo_ta_hien_trang,
          so_luong_tong: dto.so_luong_tong || asset.so_luong_tong,
          hinh_thuc_chia_se: dto.hinh_thuc_chia_se || asset.hinh_thuc_chia_se,
          hinh_thuc_trao_doi: dto.hinh_thuc_trao_doi || asset.hinh_thuc_trao_doi,
          dia_diem: dto.dia_diem || asset.dia_diem,
        },
      });

      if (dto.hinh_anh) {
        await tx.hinhAnhTaiSan.deleteMany({ where: { bai_dang_id: id } });
        await tx.hinhAnhTaiSan.createMany({
          data: dto.hinh_anh.map((url, idx) => ({
            bai_dang_id: id,
            duong_dan_anh: url,
            thu_tu_hien_thi: idx + 1,
          })),
        });
      }

      return updated;
    });
  }

  async remove(id: string, userId: string) {
    const asset = await this.findOne(id);

    if (asset.chu_so_huu_id !== userId) {
      throw new ForbiddenException('Bạn không phải chủ sở hữu bài đăng này');
    }

    const activeTx = await this.prisma.giaoDich.findFirst({
      where: {
        de_xuat: { bai_dang_id: id },
        trang_thai: { in: ['CHO_BAN_GIAO', 'CHO_BEN_CON_LAI_XAC_NHAN'] },
      },
    });

    if (activeTx) {
      throw new BadRequestException('Bài đăng có giao dịch đang diễn ra, không thể xóa');
    }

    await this.prisma.baiDangTaiSan.delete({
      where: { bai_dang_id: id },
    });

    return { message: 'Xóa bài đăng thành công' };
  }

  async getCategories() {
    return this.prisma.danhMucTaiSan.findMany({
      where: { trang_thai: 'HOAT_DONG' },
      orderBy: { ten_danh_muc: 'asc' },
    });
  }
}
