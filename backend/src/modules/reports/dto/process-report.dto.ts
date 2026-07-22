import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ProcessReportDto {
  @ApiPropertyOptional({
    description: 'Trạng thái xử lý báo cáo (DA_XU_LY hoặc TU_CHOI)',
    example: 'DA_XU_LY',
  })
  @IsString()
  @IsOptional()
  trang_thai_xu_ly?: string;

  @ApiProperty({
    description: 'Loại biện pháp xử lý vi phạm (CANH_BAO, AN_BAI_DANG, KHOA_TAI_KHOAN, KHONG_VI_PHAM)',
    example: 'AN_BAI_DANG',
  })
  @IsString()
  @IsNotEmpty({ message: 'Biện pháp xử lý không được để trống' })
  loai_bien_phap: string;

  @ApiPropertyOptional({
    description: 'Ghi chú xử lý của Quản trị viên',
    example: 'Ẩn bài đăng do phát hiện thông tin không chính xác',
  })
  @IsString()
  @IsOptional()
  ghi_chu_xu_ly?: string;

  @ApiPropertyOptional({
    description: 'Nội dung xử lý của Quản trị viên (alias ghi_chu_xu_ly)',
    example: 'Ẩn bài đăng do phát hiện thông tin không chính xác',
  })
  @IsString()
  @IsOptional()
  noi_dung_xu_ly?: string;
}
