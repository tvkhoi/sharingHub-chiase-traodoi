import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: 'Đăng ký tài khoản người dùng mới (UC5.1)',
    description: 'Khởi tạo tài khoản thành viên mới trong hệ thống. Tự động khởi tạo hồ sơ người dùng và hồ sơ uy tín ban đầu.',
  })
  @ApiResponse({ status: 201, description: 'Đăng ký tài khoản thành công.' })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({
    summary: 'Xác thực và đăng nhập hệ thống (UC5.2)',
    description: 'Xác thực tài khoản người dùng bằng Email hoặc Số điện thoại và Mật khẩu. Trả về mã thông báo JWT Access Token.',
  })
  @ApiResponse({ status: 200, description: 'Xác thực thành công, trả về JWT Access Token.' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({
    summary: 'Truy vấn thông tin tài khoản hiện tại',
    description: 'Lấy thông tin chi tiết tài khoản, hồ sơ cá nhân và chỉ số uy tín của người dùng đang thực thi yêu cầu.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: any) {
    const { mat_khau_hash, ...userInfo } = user;
    return userInfo;
  }
}
