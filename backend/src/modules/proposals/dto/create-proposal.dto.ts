import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProposalDto {
  @ApiProperty({
    description: 'Mã UUID của bài đăng tài sản muốn gửi đề xuất',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @IsString()
  @IsNotEmpty({ message: 'Bài đăng không được để trống' })
  bai_dang_id: string;

  @ApiProperty({
    description: 'Số lượng món đồ muốn xin nhận / đổi',
    example: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'Số lượng yêu cầu phải là số nguyên' })
  @Min(1, { message: 'Số lượng yêu cầu tối thiểu là 1' })
  so_luong_yeu_cau: number;

  @ApiPropertyOptional({
    description: 'Lời nhắn gửi tới chủ tài sản',
    example: 'Chào bạn, mình rất muốn nhận món đồ này cho bé học online. Cảm ơn bạn!',
  })
  @IsString()
  @IsOptional()
  loi_nhan?: string;

  @ApiPropertyOptional({
    description: 'Mô tả tài sản đối ứng mang ra trao đổi (nếu có)',
    example: 'Tai nghe Bluetooth Sony CH510 màu đen',
  })
  @IsString()
  @IsOptional()
  tai_san_doi_ung?: string;

  @ApiPropertyOptional({
    description: 'Số tiền đối ứng bù thêm (nếu có)',
    example: 150000,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Tiền đối ứng phải là số' })
  @Min(0, { message: 'Tiền đối ứng phải lớn hơn hoặc bằng 0' })
  @IsOptional()
  tien_doi_ung?: number;
}
