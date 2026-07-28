import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Họ và tên mới',
    example: 'Nguyễn Văn A (Cập nhật)',
  })
  @IsString()
  @IsOptional()
  ho_ten?: string;

  @ApiPropertyOptional({
    description: 'Đường dẫn URL ảnh đại diện',
    example: 'https://example.com/images/avatar.jpg',
  })
  @IsString()
  @IsOptional()
  anh_dai_dien?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ cụ thể',
    example: '789 Đường Điện Biên Phủ, Bình Thạnh, TP.HCM',
  })
  @IsString()
  @IsOptional()
  dia_chi?: string;

  @ApiPropertyOptional({
    description: 'Mô tả bản thân / tiểu sử',
    example: 'Thích chia sẻ đồ dùng cũ và học hỏi công nghệ',
  })
  @IsString()
  @IsOptional()
  mo_ta_ca_nhan?: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại liên hệ',
    example: '0987654321',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, { message: 'Số điện thoại không đúng định dạng hợp lệ (Ví dụ: 0912345678)' })
  so_dien_thoai?: string;
}
