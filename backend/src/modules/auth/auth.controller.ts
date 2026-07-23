import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordSendOtpDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: 'Gửi mã OTP xác thực Email thực tế qua Nodemailer SMTP',
    description: 'Tạo mã OTP 6 số ngẫu nhiên có hiệu lực 5 phút và gửi email thực tế đến hộp thư người dùng.',
  })
  @Post('send-otp')
  async sendOtp(@Body('email') email: string) {
    return this.authService.sendOtp(email);
  }

  @ApiOperation({
    summary: 'Gửi mã OTP khôi phục mật khẩu qua Email',
    description: 'Tạo mã OTP 6 số ngẫu nhiên cho tài khoản đã tồn tại và gửi qua Gmail.',
  })
  @Post('forgot-password/send-otp')
  async forgotPasswordSendOtp(@Body() dto: ForgotPasswordSendOtpDto) {
    return this.authService.forgotPasswordSendOtp(dto.email);
  }

  @ApiOperation({
    summary: 'Xác thực OTP và đặt lại mật khẩu mới',
    description: 'Xác minh mã OTP 6 số và cập nhật mật khẩu mới cho tài khoản.',
  })
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password/reset')
  async forgotPasswordReset(@Body() dto: ResetPasswordDto) {
    return this.authService.forgotPasswordReset(dto);
  }

  @ApiOperation({
    summary: 'Kiểm tra mã OTP xác thực Email',
    description: 'Đối soát mã OTP 6 số người dùng nhập với mã đã gửi.',
  })
  @Post('verify-otp')
  async verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    return this.authService.verifyOtp(email, otp);
  }

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
