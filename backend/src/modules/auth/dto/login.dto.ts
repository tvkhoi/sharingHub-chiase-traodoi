import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email hoặc Số điện thoại đăng nhập',
    example: 'user1@gmail.com',
  })
  @IsString()
  @IsNotEmpty({ message: 'Email hoặc Số điện thoại không được để trống' })
  tai_khoan: string;

  @ApiProperty({
    description: 'Mật khẩu tài khoản (tối thiểu 6 ký tự)',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  mat_khau: string;
}
