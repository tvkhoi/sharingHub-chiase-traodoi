import { Test, TestingModule } from '@nestjs/testing';
import { AssetsService } from './assets.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AssetsService', () => {
  let service: AssetsService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    danhMucTaiSan: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    baiDangTaiSan: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    hinhAnhTaiSan: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    giaoDich: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw BadRequestException if category does not exist', async () => {
      mockPrismaService.danhMucTaiSan.findUnique.mockResolvedValue(null);

      await expect(
        service.create('user-1', {
          danh_muc_id: 'invalid-cat',
          ten_tai_san: 'Laptop',
          mo_ta_hien_trang: 'Mo ta',
          so_luong_tong: 1,
          hinh_thuc_chia_se: 'CHO_TANG',
          dia_diem: 'Hanoi',
          hinh_anh: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if TRAO_DOI has no hinh_thuc_trao_doi', async () => {
      mockPrismaService.danhMucTaiSan.findUnique.mockResolvedValue({ danh_muc_id: 'cat-1' } as any);

      await expect(
        service.create('user-1', {
          danh_muc_id: 'cat-1',
          ten_tai_san: 'Laptop',
          mo_ta_hien_trang: 'Mo ta',
          so_luong_tong: 1,
          hinh_thuc_chia_se: 'TRAO_DOI',
          dia_diem: 'Hanoi',
          hinh_anh: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return asset if found', async () => {
      const assetMock = { bai_dang_id: 'asset-1', ten_tai_san: 'Chair' };
      mockPrismaService.baiDangTaiSan.findUnique.mockResolvedValue(assetMock as any);

      const result = await service.findOne('asset-1');
      expect(result).toEqual(assetMock);
    });

    it('should throw NotFoundException if asset not found', async () => {
      mockPrismaService.baiDangTaiSan.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
