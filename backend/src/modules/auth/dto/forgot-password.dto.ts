import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class ForgotPasswordSendOtpDto {
  @ApiProperty({
    description: 'Địa chỉ Email đăng ký tài khoản cần khôi phục mật khẩu',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Email không đúng định dạng hợp lệ (Ví dụ: name@example.com)' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Địa chỉ Email đăng ký tài khoản',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Email không đúng định dạng hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({
    description: 'Mã OTP 6 số đã được gửi tới Gmail',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mã OTP xác thực không được để trống' })
  otp: string;

  @ApiProperty({
    description: 'Mật khẩu mới (tối thiểu 6 ký tự)',
    example: 'newpassword123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @MinLength(6, { message: 'Mật khẩu mới phải từ 6 ký tự trở lên' })
  mat_khau_moi: string;

  @ApiPropertyOptional({
    description: 'Xác nhận lại mật khẩu mới',
    example: 'newpassword123',
  })
  @IsString()
  @IsOptional()
  xac_nhan_mat_khau_moi?: string;
}
