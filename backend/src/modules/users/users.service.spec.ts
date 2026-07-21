import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    nguoiDung: {
      findUnique: jest.fn(),
    },
    hoSoThanhVien: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    hoSoUyTin: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile if user exists', async () => {
      const mockUser = { ma_nguoi_dung: 'user-1', email: 'test@example.com' };
      mockPrismaService.nguoiDung.findUnique.mockResolvedValue(mockUser as any);

      const res = await service.getProfile('user-1');
      expect(res).toEqual(mockUser);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.nguoiDung.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('user-unknown')).rejects.toThrow(NotFoundException);
    });
  });
});
