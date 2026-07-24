import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Địa chỉ Email chính thức',
    example: 'user1@gmail.com',
  })
  @IsEmail({}, { message: 'Email không đúng định dạng hợp lệ (Ví dụ: name@example.com)' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại liên hệ',
    example: '0912345678',
  })
  @IsString()
  @IsOptional()
  @Matches(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, { message: 'Số điện thoại không đúng định dạng hợp lệ (Ví dụ: 0912345678)' })
  so_dien_thoai?: string;

  @ApiProperty({
    description: 'Mật khẩu bảo mật (tối thiểu 6 ký tự)',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  mat_khau: string;

  @ApiPropertyOptional({
    description: 'Xác nhận lại mật khẩu',
    example: '123456',
  })
  @IsString()
  @IsOptional()
  xac_nhan_mat_khau?: string;

  @ApiProperty({
    description: 'Họ và tên người dùng',
    example: 'Nguyễn Văn A',
  })
  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  ho_ten: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ khu vực',
    example: 'Quận 5, TP.HCM',
  })
  @IsString()
  @IsOptional()
  dia_chi?: string;
}
