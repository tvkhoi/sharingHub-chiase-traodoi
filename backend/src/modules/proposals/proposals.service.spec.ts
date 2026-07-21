import { Test, TestingModule } from '@nestjs/testing';
import { ProposalsService } from './proposals.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProposalsService', () => {
  let service: ProposalsService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    baiDangTaiSan: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    deXuatGiaoDich: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    giaoDich: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProposalsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProposalsService>(ProposalsService);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw BadRequestException if user proposes on their own asset', async () => {
      mockPrismaService.baiDangTaiSan.findUnique.mockResolvedValue({
        bai_dang_id: 'asset-1',
        chu_so_huu_id: 'user-owner',
        trang_thai: 'KHA_DUNG',
        so_luong_kha_dung: 5,
      } as any);

      await expect(
        service.create('user-owner', { bai_dang_id: 'asset-1', so_luong_yeu_cau: 1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if requested quantity exceeds available quantity', async () => {
      mockPrismaService.baiDangTaiSan.findUnique.mockResolvedValue({
        bai_dang_id: 'asset-1',
        chu_so_huu_id: 'user-owner',
        trang_thai: 'KHA_DUNG',
        so_luong_kha_dung: 2,
      } as any);

      await expect(
        service.create('user-requester', { bai_dang_id: 'asset-1', so_luong_yeu_cau: 5 }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
