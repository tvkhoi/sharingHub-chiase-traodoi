import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ReportsService', () => {
  let service: ReportsService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    baiDangTaiSan: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    nguoiDung: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    baoCaoViPham: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    bienPhapXuLy: {
      create: jest.fn(),
    },
    hoSoUyTin: {
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('createReport', () => {
    it('should throw NotFoundException if reported post does not exist', async () => {
      mockPrismaService.baiDangTaiSan.findUnique.mockResolvedValue(null);

      await expect(
        service.createReport('user-1', {
          bai_dang_bi_bao_cao_id: 'invalid-post',
          ly_do_bao_cao: 'Vi phạm',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if reported user does not exist', async () => {
      mockPrismaService.nguoiDung.findUnique.mockResolvedValue(null);

      await expect(
        service.createReport('user-1', {
          nguoi_dung_bi_bao_cao_id: 'invalid-user',
          ly_do_bao_cao: 'Spam',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
