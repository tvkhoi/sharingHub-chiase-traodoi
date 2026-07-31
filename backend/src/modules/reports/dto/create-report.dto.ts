import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MinhChungDto {
  @ApiProperty({
    description: 'Đường dẫn tệp đính kèm',
    example: 'https://example.com/evidence-image.jpg',
  })
  @IsString()
  @IsNotEmpty()
  duong_dan_tep: string;

  @ApiPropertyOptional({ description: 'Tên tệp gốc', example: 'bien_ban.png' })
  @IsString()
  @IsOptional()
  ten_tep?: string;

  @ApiPropertyOptional({ description: 'Loại tệp MIME type', example: 'image/png' })
  @IsString()
  @IsOptional()
  loai_tep?: string;

  @ApiPropertyOptional({ description: 'Kích thước tệp (bytes)', example: 102400 })
  @IsOptional()
  kich_thuoc_tep?: number;

  @ApiPropertyOptional({ description: 'Thứ tự hiển thị', example: 1 })
  @IsOptional()
  thu_tu_hien_thi?: number;
}

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
    description: 'Mô tả chi tiết bằng chứng vi phạm',
    example: 'Sách in lậu, mô tả gian lận...',
  })
  @IsString()
  @IsOptional()
  mo_ta_chi_tiet?: string;

  @ApiPropertyOptional({
    description: 'Đường dẫn ảnh/link minh chứng vi phạm (nếu có - alias cũ)',
    example: 'https://example.com/evidence-image.jpg',
  })
  @IsString()
  @IsOptional()
  bang_chung_hinh_anh?: string;

  @ApiPropertyOptional({
    description: 'Đường dẫn ảnh/link minh chứng vi phạm (alias minh_chung)',
    example: 'https://example.com/evidence-image.jpg',
  })
  @IsString()
  @IsOptional()
  minh_chung?: string;

  @ApiPropertyOptional({
    description: 'Danh sách các tệp minh chứng đính kèm (bảng minh_chung_bao_cao)',
    type: [MinhChungDto],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MinhChungDto)
  danh_sach_minh_chung?: MinhChungDto[];

  @ApiPropertyOptional({
    description: 'Loại báo cáo hoặc kháng cáo (BAI_DANG, NGUOI_DUNG, KHANG_CAO...)',
    example: 'KHANG_CAO',
  })
  @IsString()
  @IsOptional()
  loai_bao_cao?: string;
}
