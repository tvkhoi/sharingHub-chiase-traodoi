import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    giaoDich: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    baiDangTaiSan: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    hoSoUyTin: {
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should throw ForbiddenException if user is not in transaction', async () => {
      mockPrismaService.giaoDich.findUnique.mockResolvedValue({
        giao_dich_id: 'tx-1',
        nguoi_so_huu_id: 'user-1',
        nguoi_tiep_nhan_id: 'user-2',
      } as any);

      await expect(service.findOne('tx-1', 'stranger-user')).rejects.toThrow(ForbiddenException);
    });

    it('should return transaction if user is owner or receiver', async () => {
      const txMock = {
        giao_dich_id: 'tx-1',
        nguoi_so_huu_id: 'user-1',
        nguoi_tiep_nhan_id: 'user-2',
      };
      mockPrismaService.giaoDich.findUnique.mockResolvedValue(txMock as any);

      const result = await service.findOne('tx-1', 'user-1');
      expect(result).toEqual(txMock);
    });
  });
});
