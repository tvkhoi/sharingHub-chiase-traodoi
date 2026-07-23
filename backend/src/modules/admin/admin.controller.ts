import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('QUAN_TRI_VIEN')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get('users')
  getUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('vai_tro') vai_tro?: string,
    @Query('trang_thai') trang_thai?: string,
  ) {
    return this.adminService.getUsers({ page, limit, search, vai_tro, trang_thai });
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id') userId: string,
    @Body('trang_thai') trang_thai: 'HOAT_DONG' | 'BI_KHOA',
  ) {
    return this.adminService.updateUserStatus(userId, trang_thai);
  }

  @Get('assets')
  getAssetsAdmin(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('trang_thai') trang_thai?: string,
  ) {
    return this.adminService.getAssetsAdmin({ page, limit, search, trang_thai });
  }

  @Patch('assets/:id/status')
  updateAssetStatusAdmin(
    @Param('id') assetId: string,
    @Body('trang_thai') trang_thai: 'KHA_DUNG' | 'DA_KHOA_SO' | 'DA_KET_THUC',
  ) {
    return this.adminService.updateAssetStatusAdmin(assetId, trang_thai);
  }
}
