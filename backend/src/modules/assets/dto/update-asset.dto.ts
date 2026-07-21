import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAssetDto {
  @ApiPropertyOptional({
    description: 'Mã UUID của danh mục tài sản',
    example: '774cab95-d36d-4028-b273-f971e30fdeec',
  })
  @IsString()
  @IsOptional()
  danh_muc_id?: string;

  @ApiPropertyOptional({
    description: 'Tên tài sản cần chia sẻ / trao đổi',
    example: 'Laptop Dell XPS 13 cũ (Cập nhật)',
  })
  @IsString()
  @IsOptional()
  ten_tai_san?: string;

  @ApiPropertyOptional({
    description: 'Mô tả thông số kỹ thuật và tình trạng tài sản',
    example: 'Máy dùng tốt, vừa thay pin mới',
  })
  @IsString()
  @IsOptional()
  mo_ta_hien_trang?: string;

  @ApiPropertyOptional({
    description: 'Số lượng tổng',
    example: 2,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  so_luong_tong?: number;

  @ApiPropertyOptional({
    description: 'Hình thức chia sẻ (CHO_TANG, TRAO_DOI)',
    example: 'CHO_TANG',
  })
  @IsString()
  @IsOptional()
  hinh_thuc_chia_se?: string;

  @ApiPropertyOptional({
    description: 'Hình thức trao đổi (TAI_SAN, TIEN)',
    example: 'TAI_SAN',
  })
  @IsString()
  @IsOptional()
  hinh_thuc_trao_doi?: string;

  @ApiPropertyOptional({
    description: 'Địa điểm giao nhận',
    example: '456 Lê Hồng Phong, Quận 10, TP.HCM',
  })
  @IsString()
  @IsOptional()
  dia_diem?: string;

  @ApiPropertyOptional({
    description: 'Danh sách các đường dẫn URL hình ảnh mới',
    example: ['http://localhost:5000/uploads/file-1721544000-456.jpg'],
    type: [String],
  })
  @IsArray({ message: 'Danh sách hình ảnh phải là mảng chuỗi đường dẫn URL' })
  @IsString({ each: true })
  @IsOptional()
  hinh_anh?: string[];
}
