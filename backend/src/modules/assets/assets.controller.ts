import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { QueryAssetDto } from './dto/query-asset.dto';
import { QueryPaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Assets')
@Controller('api/v1')
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @ApiOperation({
    summary: 'Lấy danh sách danh mục tài sản',
    description: 'Truy vấn danh sách tất cả danh mục tài sản được phân loại trong hệ thống.',
  })
  @Get('categories')
  async getCategories() {
    return this.assetsService.getCategories();
  }

  @ApiOperation({
    summary: 'Lấy danh sách từ khóa tìm kiếm phổ biến hệ thống',
    description: 'Trả về các từ khóa được toàn bộ người dùng tìm kiếm nhiều nhất lưu trong bộ nhớ RAM.',
  })
  @Get('assets/trending-searches')
  async getTrendingSearches() {
    return { trending: this.assetsService.getTrendingSearches() };
  }

  @ApiOperation({
    summary: 'Đăng tải bài đăng tài sản mới (UC1.1)',
    description: 'Tạo bài đăng chia sẻ hoặc trao đổi tài sản mới (chuẩn RESTful JSON). Yêu cầu truyền danh sách đường dẫn URL hình ảnh thu được sau khi gọi API tải lên tệp tin /api/v1/upload/multiple.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('assets')
  async create(
    @CurrentUser('nguoi_dung_id') userId: string,
    @Body() dto: CreateAssetDto,
  ) {
    if (!dto.hinh_anh || dto.hinh_anh.length === 0) {
      throw new BadRequestException('Vui lòng cung cấp ít nhất 01 đường dẫn URL hình ảnh trong mảng hinh_anh');
    }

    return this.assetsService.create(userId, dto);
  }

  @ApiOperation({
    summary: 'Tìm kiếm và lọc bài đăng tài sản (UC2.1)',
    description: 'Truy vấn danh sách bài đăng tài sản có phân trang, hỗ trợ lọc theo danh mục, hình thức chia sẻ, trạng thái và từ khóa tìm kiếm.',
  })
  @Get('assets')
  async findAll(@Query() query: QueryAssetDto) {
    return this.assetsService.findAll(query);
  }

  @ApiOperation({
    summary: 'Danh sách bài đăng tài sản của người dùng hiện tại (UC1.4)',
    description: 'Truy vấn các bài đăng tài sản do người dùng đang đăng nhập khởi tạo (có phân trang).',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('assets/my')
  async findMyAssets(
    @CurrentUser('nguoi_dung_id') userId: string,
    @Query() query: QueryPaginationDto,
  ) {
    return this.assetsService.findMyAssets(userId, query);
  }

  @ApiOperation({
    summary: 'Truy vấn chi tiết bài đăng tài sản (UC2.2)',
    description: 'Trả về thông tin chi tiết bài đăng tài sản kèm danh sách hình ảnh, danh mục và thông tin người đăng.',
  })
  @ApiParam({ name: 'id', description: 'Mã định danh UUID của bài đăng tài sản' })
  @Get('assets/:id')
  async findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Cập nhật thông tin bài đăng tài sản (UC1.2)',
    description: 'Cập nhật nội dung bài đăng tài sản thuộc quyền sở hữu của người dùng hiện tại.',
  })
  @ApiParam({ name: 'id', description: 'Mã định danh UUID của bài đăng tài sản' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('assets/:id')
  async update(
    @Param('id') id: string,
    @CurrentUser('nguoi_dung_id') userId: string,
    @Body() dto: UpdateAssetDto,
  ) {
    return this.assetsService.update(id, userId, dto);
  }

  @ApiOperation({
    summary: 'Xóa bài đăng tài sản (UC1.3)',
    description: 'Hủy bài đăng tài sản thuộc quyền sở hữu của người dùng hiện tại (chỉ áp dụng khi không có giao dịch đang xử lý).',
  })
  @ApiParam({ name: 'id', description: 'Mã định danh UUID của bài đăng tài sản' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('assets/:id')
  async remove(
    @Param('id') id: string,
    @CurrentUser('nguoi_dung_id') userId: string,
  ) {
    return this.assetsService.remove(id, userId);
  }

  @ApiOperation({ summary: 'Admin thêm danh mục mới' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('admin/categories')
  async createCategory(@Body() body: { ten_danh_muc: string; mo_ta?: string; bieu_tuong?: string }) {
    return this.assetsService.createCategory(body);
  }

  @ApiOperation({ summary: 'Admin chỉnh sửa danh mục' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('admin/categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() body: { ten_danh_muc?: string; mo_ta?: string; bieu_tuong?: string; trang_thai?: string },
  ) {
    return this.assetsService.updateCategory(id, body);
  }

  @ApiOperation({ summary: 'Admin xóa danh mục' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('admin/categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.assetsService.deleteCategory(id);
  }
}
