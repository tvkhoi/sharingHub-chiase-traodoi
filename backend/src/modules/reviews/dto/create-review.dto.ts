import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Mã UUID của giao dịch đã hoàn tất',
    example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  })
  @IsString()
  @IsNotEmpty({ message: 'Giao dịch không được để trống' })
  giao_dich_id: string;

  @ApiProperty({
    description: 'Số sao đánh giá độ uy tín / chất lượng (từ 1 đến 5 sao)',
    example: 5,
  })
  @Type(() => Number)
  @IsInt({ message: 'Số sao phải là số nguyên' })
  @Min(1, { message: 'Đánh giá tối thiểu 1 sao' })
  @Max(5, { message: 'Đánh giá tối đa 5 sao' })
  diem_sao: number;

  @ApiPropertyOptional({
    description: 'Nội dung nhận xét chi tiết',
    example: 'Người giao thân thiện, tài sản đúng như mô tả!',
  })
  @IsString()
  @IsOptional()
  nhan_xet?: string;
}
