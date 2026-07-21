import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ProcessReportDto {
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
}
