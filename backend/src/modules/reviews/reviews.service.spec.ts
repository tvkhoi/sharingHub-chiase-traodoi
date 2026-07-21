import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    giaoDich: {
      findUnique: jest.fn(),
    },
    danhGia: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    hoSoUyTin: {
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('createReview', () => {
    it('should throw NotFoundException if transaction does not exist', async () => {
      mockPrismaService.giaoDich.findUnique.mockResolvedValue(null);

      await expect(
        service.createReview('user-1', { giao_dich_id: 'invalid-tx', diem_sao: 5 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if transaction is not completed', async () => {
      mockPrismaService.giaoDich.findUnique.mockResolvedValue({
        giao_dich_id: 'tx-1',
        trang_thai: 'CHO_BAN_GIAO',
      } as any);

      await expect(
        service.createReview('user-1', { giao_dich_id: 'tx-1', diem_sao: 5 }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
