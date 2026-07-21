import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v2 as cloudinary } from 'cloudinary';

export const multerOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = join(process.cwd(), 'uploads');
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `file-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Chỉ chấp nhận các tệp định dạng hình ảnh (jpg, jpeg, png, gif, webp)'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // Tối đa 5MB
  },
};

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private isCloudinaryConfigured = false;

  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.isCloudinaryConfigured = true;
      this.logger.log('Cloudinary FREE Cloud Storage Service initialized successfully');
    } else {
      this.logger.log('Using Local Disk Storage for Uploads (/uploads)');
    }
  }

  async processUpload(file: any, host: string, protocol: string): Promise<string> {
    if (!file) {
      throw new BadRequestException('Vui lòng cung cấp 01 tệp tin hình ảnh');
    }

    if (this.isCloudinaryConfigured) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'asset-sharing',
        });
        // Remove temp local file after Cloudinary upload
        if (existsSync(file.path)) {
          unlinkSync(file.path);
        }
        return result.secure_url;
      } catch (error) {
        this.logger.error('Failed to upload image to Cloudinary, fallback to local file', error);
      }
    }

    return `${protocol}://${host}/uploads/${file.filename}`;
  }

  async processMultipleUploads(files: any[], host: string, protocol: string): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất 01 tệp tin hình ảnh');
    }

    const uploadPromises = files.map((file) => this.processUpload(file, host, protocol));
    return Promise.all(uploadPromises);
  }
}
