import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockPrismaService = {
    nguoiDung: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    hoSoThanhVien: {
      create: jest.fn(),
    },
    hoSoUyTin: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const dto = {
        email: 'test@example.com',
        mat_khau: 'Password123',
        ho_ten: 'Test User',
        so_dien_thoai: '0912345678',
      };

      mockPrismaService.nguoiDung.findUnique.mockResolvedValue(null);
      mockPrismaService.nguoiDung.create.mockResolvedValue({
        ma_nguoi_dung: 'user-uuid-1',
        email: dto.email,
        vai_tro: 'THANH_VIEN',
        trang_thai: 'HOAT_DONG',
      });
      mockJwtService.sign.mockReturnValue('mocked-jwt-token');

      const result = await service.register(dto);

      expect(result).toHaveProperty('access_token', 'mocked-jwt-token');
      expect(result.user.email).toBe(dto.email);
    });

    it('should throw BadRequestException if email already exists', async () => {
      const dto = {
        email: 'existing@example.com',
        mat_khau: 'Password123',
        ho_ten: 'Test User',
      };

      mockPrismaService.nguoiDung.findUnique.mockResolvedValue({ ma_nguoi_dung: 'user-1' } as any);

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should return token and user on successful login', async () => {
      const dto = { tai_khoan: 'test@example.com', mat_khau: 'Password123' };
      const hashedPassword = await bcrypt.hash(dto.mat_khau, 10);

      mockPrismaService.nguoiDung.findFirst.mockResolvedValue({
        ma_nguoi_dung: 'user-uuid-1',
        email: dto.tai_khoan,
        mat_khau_hash: hashedPassword,
        vai_tro: 'THANH_VIEN',
        trang_thai: 'HOAT_DONG',
        ho_so: { ho_ten: 'Test User' },
        ho_so_uy_tin: { diem_uy_tin: 100 },
      } as any);

      mockJwtService.sign.mockReturnValue('mocked-jwt-token');

      const result = await service.login(dto);

      expect(result).toHaveProperty('access_token', 'mocked-jwt-token');
      expect(result.user.email).toBe(dto.tai_khoan);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const dto = { tai_khoan: 'test@example.com', mat_khau: 'WrongPassword' };

      mockPrismaService.nguoiDung.findFirst.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
