import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { multerOptions, UploadService } from './upload.service';

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @ApiOperation({
    summary: 'Tải lên 01 tệp tin hình ảnh',
    description: 'Tải lên 01 tệp tin hình ảnh từ thiết bị người dùng (định dạng: JPG, PNG, WEBP, GIF, dung lượng tối đa 5MB). Trả về đường dẫn URL công khai của tệp tin.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Tệp tin hình ảnh đính kèm',
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Tệp tin hình ảnh tải lên từ thiết bị',
        },
      },
    },
  })
  @Post('single')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadSingleFile(@UploadedFile() file: any, @Req() req: Request) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn 01 tệp tin hình ảnh để tải lên');
    }
    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = await this.uploadService.processUpload(file, host, protocol);

    return {
      message: 'Tải lên tệp tin hình ảnh thành công',
      url: fileUrl,
      filename: file.filename,
    };
  }

  @ApiOperation({
    summary: 'Tải lên nhiều tệp tin hình ảnh',
    description: 'Tải lên đồng thời danh sách nhiều tệp tin hình ảnh từ thiết bị người dùng. Trả về danh sách các đường dẫn URL công khai.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Danh sách tệp tin hình ảnh đính kèm',
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Danh sách tệp tin hình ảnh tải lên từ thiết bị',
        },
      },
    },
  })
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  async uploadMultipleFiles(@UploadedFiles() files: any[], @Req() req: Request) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất 01 tệp tin hình ảnh');
    }
    const host = req.get('host');
    const protocol = req.protocol;
    const urls = await this.uploadService.processMultipleUploads(files, host, protocol);

    return {
      message: 'Tải lên danh sách tệp tin hình ảnh thành công',
      urls: urls,
      count: files.length,
    };
  }
}
