import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAssetDto {
  @ApiProperty({
    description: 'Mã định danh UUID của danh mục tài sản',
    example: '774cab95-d36d-4028-b273-f971e30fdeec',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mã danh mục không được để trống' })
  danh_muc_id: string;

  @ApiProperty({
    description: 'Tên tài sản cần chia sẻ hoặc trao đổi',
    example: 'Laptop Dell XPS 13',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tên tài sản không được để trống' })
  ten_tai_san: string;

  @ApiProperty({
    description: 'Mô tả thông số kỹ thuật và tình trạng tài sản',
    example: 'Máy sử dụng tốt, RAM 16GB, SSD 512GB, tình trạng ngoại hình 90%',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mô tả hiện trạng không được để trống' })
  mo_ta_hien_trang: string;

  @ApiProperty({
    description: 'Tổng số lượng tài sản khả dụng (số nguyên >= 1)',
    example: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'Số lượng tổng phải là số nguyên' })
  @Min(1, { message: 'Số lượng tổng phải lớn hơn hoặc bằng 1' })
  so_luong_tong: number;

  @ApiProperty({
    description: 'Hình thức chia sẻ: CHO_TANG hoặc TRAO_DOI',
    example: 'TRAO_DOI',
  })
  @IsString()
  @IsNotEmpty({ message: 'Hình thức chia sẻ không được để trống' })
  hinh_thuc_chia_se: string;

  @ApiPropertyOptional({
    description: 'Hình thức nhận lại nếu lựa chọn TRAO_DOI: TAI_SAN hoặc TIEN',
    example: 'TAI_SAN',
  })
  @IsString()
  @IsOptional()
  hinh_thuc_trao_doi?: string;

  @ApiProperty({
    description: 'Địa chỉ địa lý thực hiện giao nhận trực tiếp',
    example: '123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM',
  })
  @IsString()
  @IsNotEmpty({ message: 'Địa điểm không được để trống' })
  dia_diem: string;

  @ApiProperty({
    description: 'Danh sách đường dẫn URL hình ảnh (lấy từ kết quả API /api/v1/upload/multiple)',
    example: ['http://localhost:5000/uploads/file-1721544000-123.jpg'],
    type: [String],
  })
  @IsArray({ message: 'Danh sách hình ảnh phải là mảng chuỗi đường dẫn URL' })
  @IsString({ each: true, message: 'Mỗi đường dẫn hình ảnh phải là chuỗi' })
  @IsNotEmpty({ message: 'Danh sách hình ảnh không được để trống' })
  hinh_anh: string[];
}
