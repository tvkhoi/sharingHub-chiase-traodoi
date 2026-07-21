import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateReportDto {
  @ApiPropertyOptional({
    description: 'Mã UUID của người dùng bị báo cáo (nếu báo cáo thành viên vi phạm)',
    example: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
  })
  @IsString()
  @IsOptional()
  nguoi_dung_bi_bao_cao_id?: string;

  @ApiPropertyOptional({
    description: 'Mã UUID của bài đăng bị báo cáo (nếu báo cáo bài đăng vi phạm)',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @IsString()
  @IsOptional()
  bai_dang_bi_bao_cao_id?: string;

  @ApiProperty({
    description: 'Lý do báo cáo vi phạm',
    example: 'Bài đăng có nội dung gian lận / hàng giả',
  })
  @IsString()
  @IsNotEmpty({ message: 'Lý do báo cáo không được để trống' })
  ly_do_bao_cao: string;

  @ApiPropertyOptional({
    description: 'Đường dẫn ảnh/link minh chứng vi phạm (nếu có)',
    example: 'https://example.com/evidence-image.jpg',
  })
  @IsString()
  @IsOptional()
  bang_chung_hinh_anh?: string;
}
