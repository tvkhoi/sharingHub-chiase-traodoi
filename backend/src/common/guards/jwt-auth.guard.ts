import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
    }
    if (user.trang_thai === 'DA_KHOA') {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa do vi phạm quy định');
    }
    return user;
  }
}
