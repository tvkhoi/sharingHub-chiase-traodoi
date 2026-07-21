import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryAssetDto {
  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm (tên tài sản, mô tả)',
    example: 'Laptop',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo mã danh mục tài sản',
    example: '774cab95-d36d-4028-b273-f971e30fdeec',
  })
  @IsString()
  @IsOptional()
  danh_muc_id?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo địa điểm (ví dụ: Quận 5, TP.HCM)',
    example: 'Quận 5',
  })
  @IsString()
  @IsOptional()
  dia_diem?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo hình thức chia sẻ (CHO_TANG, TRAO_DOI)',
    example: 'TRAO_DOI',
  })
  @IsString()
  @IsOptional()
  hinh_thuc_chia_se?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái bài đăng (KHA_DUNG, TAM_HET_KHA_DUNG, DA_KET_THUC)',
    example: 'KHA_DUNG',
  })
  @IsString()
  @IsOptional()
  trang_thai?: string;

  @ApiPropertyOptional({
    description: 'Trang cần hiển thị (bắt đầu từ 1)',
    example: 1,
  })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Số lượng kết quả trên mỗi trang',
    example: 10,
  })
  @IsOptional()
  limit?: number;
}
