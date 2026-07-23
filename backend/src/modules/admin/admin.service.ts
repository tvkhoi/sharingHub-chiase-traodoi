import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // 1. Get System Statistics
  async getSystemStats() {
    const [
      totalUsers,
      activeUsers,
      lockedUsers,
      totalAssets,
      availableAssets,
      totalTransactions,
      completedTransactions,
      totalReports,
      pendingReports,
    ] = await Promise.all([
      this.prisma.nguoiDung.count(),
      this.prisma.nguoiDung.count({ where: { trang_thai: 'HOAT_DONG' } }),
      this.prisma.nguoiDung.count({ where: { trang_thai: 'BI_KHOA' } }),
      this.prisma.baiDangTaiSan.count(),
      this.prisma.baiDangTaiSan.count({ where: { trang_thai: 'KHA_DUNG' } }),
      this.prisma.giaoDich.count(),
      this.prisma.giaoDich.count({ where: { trang_thai: 'HOAN_TAT' } }),
      this.prisma.baoCaoViPham.count(),
      this.prisma.baoCaoViPham.count({ where: { trang_thai_xu_ly: 'CHO_KIEM_DUYET' } }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        locked: lockedUsers,
      },
      assets: {
        total: totalAssets,
        available: availableAssets,
      },
      transactions: {
        total: totalTransactions,
        completed: completedTransactions,
      },
      reports: {
        total: totalReports,
        pending: pendingReports,
      },
    };
  }

  // 2. Get All Users (Paginated & Filterable)
  async getUsers(query: {
    page?: number;
    limit?: number;
    search?: string;
    vai_tro?: string;
    trang_thai?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.vai_tro) {
      where.vai_tro = query.vai_tro;
    }

    if (query.trang_thai) {
      where.trang_thai = query.trang_thai;
    }

    if (query.search && query.search.trim() !== '') {
      const keyword = query.search.trim();
      where.OR = [
        { email: { contains: keyword, mode: 'insensitive' } },
        { ho_so: { isNot: null, ho_ten: { contains: keyword, mode: 'insensitive' } } },
        { ho_so: { isNot: null, so_dien_thoai: { contains: keyword, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.nguoiDung.findMany({
        where,
        skip,
        take: limit,
        orderBy: { ngay_tao: 'desc' },
        include: {
          ho_so: true,
          ho_so_uy_tin: true,
        },
      }),
      this.prisma.nguoiDung.count({ where }),
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

  // 3. Update User Status (Lock / Unlock)
  async updateUserStatus(userId: string, trang_thai: 'HOAT_DONG' | 'BI_KHOA') {
    const user = await this.prisma.nguoiDung.findUnique({
      where: { nguoi_dung_id: userId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    if (user.vai_tro === 'QUAN_TRI_VIEN') {
      throw new BadRequestException('Không thể khóa tài khoản Quản trị viên');
    }

    return this.prisma.nguoiDung.update({
      where: { nguoi_dung_id: userId },
      data: { trang_thai },
      include: { ho_so: true, ho_so_uy_tin: true },
    });
  }

  // 4. Get System Assets (Admin view with status filter)
  async getAssetsAdmin(query: {
    page?: number;
    limit?: number;
    search?: string;
    trang_thai?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.trang_thai) {
      where.trang_thai = query.trang_thai;
    }

    if (query.search && query.search.trim() !== '') {
      const keyword = query.search.trim();
      where.OR = [
        { ten_tai_san: { contains: keyword, mode: 'insensitive' } },
        { mo_ta_hien_trang: { contains: keyword, mode: 'insensitive' } },
        { dia_diem: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.baiDangTaiSan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { ngay_tao: 'desc' },
        include: {
          danh_muc: true,
          chu_so_huu: {
            include: { ho_so: true },
          },
          hinh_anh: true,
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

  // 5. Update Asset Status (Admin lock/unlock asset)
  async updateAssetStatusAdmin(assetId: string, trang_thai: 'KHA_DUNG' | 'DA_KHOA_SO' | 'DA_KET_THUC') {
    const asset = await this.prisma.baiDangTaiSan.findUnique({
      where: { bai_dang_id: assetId },
    });

    if (!asset) {
      throw new NotFoundException('Không tìm thấy bài đăng tài sản');
    }

    return this.prisma.baiDangTaiSan.update({
      where: { bai_dang_id: assetId },
      data: { trang_thai },
      include: { danh_muc: true, hinh_anh: true },
    });
  }
}
