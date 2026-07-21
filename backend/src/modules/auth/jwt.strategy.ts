import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          let token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
          if (token) {
            token = token.trim().replace(/^["']|["']$/g, '');
            if (token.startsWith('Bearer ')) {
              token = token.replace(/^Bearer\s+/i, '');
            }
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super-secret-key-asset-sharing-system-2026',
    });
  }

  async validate(payload: { sub: string; email: string; vai_tro: string }) {
    const user = await this.prisma.nguoiDung.findUnique({
      where: { nguoi_dung_id: payload.sub },
      include: {
        ho_so: true,
        ho_so_uy_tin: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    if (user.trang_thai === 'BI_KHOA') {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    return user;
  }
}
