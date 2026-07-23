import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ProcessReportDto } from './dto/process-report.dto';
import { QueryPaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @ApiOperation({
    summary: 'Khởi tạo báo cáo vi phạm (UC7.1)',
    description: 'Gửi báo cáo phản ánh hành vi vi phạm đối với bài đăng tài sản hoặc tài khoản người dùng khác.',
  })
  @Post()
  async createReport(
    @CurrentUser('nguoi_dung_id') userId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.createReport(userId, dto);
  }

  @ApiOperation({
    summary: 'Truy vấn danh sách báo cáo vi phạm [Quản trị viên] (UC7.2)',
    description: 'Trả về danh sách báo cáo vi phạm chưa xử lý và đã xử lý dành cho Quản trị viên (có phân trang).',
  })
  @Roles('QUAN_TRI_VIEN')
  @Get()
  async getAllReports(@Query() query: QueryPaginationDto) {
    return this.reportsService.getAllReportsAdmin(query);
  }

  @ApiOperation({
    summary: 'Truy vấn chi tiết báo cáo vi phạm [Quản trị viên] (UC7.3)',
    description: 'Trả về thông tin chi tiết nội dung báo cáo vi phạm, đối tượng bị báo cáo và người tạo báo cáo.',
  })
  @ApiParam({ name: 'id', description: 'Mã định danh UUID của báo cáo vi phạm' })
  @Roles('QUAN_TRI_VIEN')
  @Get(':id')
  async getReportById(@Param('id') id: string) {
    return this.reportsService.getReportByIdAdmin(id);
  }

  @ApiOperation({
    summary: 'Thực thi biện pháp xử lý vi phạm [Quản trị viên] (UC7.4)',
    description: 'Phê duyệt hoặc từ chối báo cáo vi phạm. Hỗ trợ áp dụng hình phạt tự động: Khóa bài đăng hoặc Khóa tài khoản vi phạm.',
  })
  @ApiParam({ name: 'id', description: 'Mã định danh UUID của báo cáo vi phạm' })
  @Roles('QUAN_TRI_VIEN')
  @Post(':id/action')
  async processReport(
    @Param('id') id: string,
    @CurrentUser('nguoi_dung_id') adminId: string,
    @Body() dto: ProcessReportDto,
  ) {
    return this.reportsService.processReportAdmin(id, adminId, dto);
  }
}
