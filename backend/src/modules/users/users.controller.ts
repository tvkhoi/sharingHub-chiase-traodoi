import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('api/v1/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({
    summary: 'Truy vấn hồ sơ người dùng công khai (UC5.3)',
    description: 'Trả về thông tin hồ sơ cá nhân công khai và lịch sử hoạt động của thành viên theo mã định danh.',
  })
  @ApiParam({ name: 'id', description: 'Mã định danh UUID của người dùng' })
  @Get('profile/:id')
  async getProfile(@Param('id') id: string) {
    return this.usersService.getProfile(id);
  }

  @ApiOperation({
    summary: 'Cập nhật thông tin hồ sơ cá nhân (UC5.3)',
    description: 'Cập nhật thông tin họ tên, ảnh đại diện, địa chỉ và mô tả bản thân của tài khoản đang đăng nhập.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @CurrentUser('nguoi_dung_id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @ApiOperation({
    summary: 'Truy vấn hồ sơ chỉ số uy tín (UC6.2)',
    description: 'Trả về chỉ số điểm uy tín, số lượt đánh giá và điểm trung bình tích lũy của thành viên.',
  })
  @ApiParam({ name: 'id', description: 'Mã định danh UUID của người dùng' })
  @Get('reputation/:id')
  async getReputation(@Param('id') id: string) {
    return this.usersService.getReputationProfile(id);
  }
}
