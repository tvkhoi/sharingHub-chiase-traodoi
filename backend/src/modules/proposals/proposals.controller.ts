import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Proposals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/proposals')
export class ProposalsController {
  constructor(private proposalsService: ProposalsService) {}

  @ApiOperation({
    summary: 'Khởi tạo đề xuất nhận hoặc trao đổi tài sản (UC2.3)',
    description: 'Tạo đề xuất yêu cầu nhận tài sản hoặc trao đổi tài sản. Tự động kiểm tra số lượng tồn kho khả dụng.',
  })
  @Post()
  async create(
    @CurrentUser('nguoi_dung_id') userId: string,
    @Body() dto: CreateProposalDto,
  ) {
    return this.proposalsService.create(userId, dto);
  }

  @ApiOperation({
    summary: 'Truy vấn các đề xuất nhận được (UC3.1)',
    description: 'Danh sách các đề xuất từ những người dùng khác gửi tới bài đăng tài sản thuộc quyền sở hữu của người dùng hiện tại.',
  })
  @Get('received')
  async getReceived(@CurrentUser('nguoi_dung_id') userId: string) {
    return this.proposalsService.getReceivedProposals(userId);
  }

  @ApiOperation({
    summary: 'Truy vấn các đề xuất đã gửi (UC3.1)',
    description: 'Danh sách các đề xuất mà người dùng hiện tại đã khởi tạo gửi tới các bài đăng tài sản khác.',
  })
  @Get('sent')
  async getSent(@CurrentUser('nguoi_dung_id') userId: string) {
    return this.proposalsService.getSentProposals(userId);
  }

  @ApiOperation({
    summary: 'Truy vấn chi tiết đề xuất giao dịch',
    description: 'Trả về thông tin chi tiết của một đề xuất giao dịch theo mã định danh UUID.',
  })
  @ApiParam({ name: 'id', description: 'Mã định danh UUID của đề xuất' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.proposalsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Chấp nhận đề xuất giao dịch (UC3.2)',
    description: 'Chủ bài đăng chấp nhận đề xuất. Hệ thống tự động chuyển trạng thái bài đăng và khởi tạo bản ghi Giao dịch mới.',
  })
  @ApiParam({ name: 'id', description: 'Mã định danh UUID của đề xuất' })
  @Put(':id/accept')
  async accept(
    @Param('id') id: string,
    @CurrentUser('nguoi_dung_id') userId: string,
  ) {
    return this.proposalsService.acceptProposal(id, userId);
  }

  @ApiOperation({
    summary: 'Từ chối đề xuất giao dịch (UC3.2)',
    description: 'Chủ bài đăng từ chối đề xuất. Hệ thống giải phóng số lượng tài sản giữ chỗ.',
  })
  @ApiParam({ name: 'id', description: 'Mã định danh UUID của đề xuất' })
  @Put(':id/reject')
  async reject(
    @Param('id') id: string,
    @CurrentUser('nguoi_dung_id') userId: string,
    @Body('ly_do_tu_choi') lyDoTuChoi?: string,
  ) {
    return this.proposalsService.rejectProposal(id, userId, lyDoTuChoi);
  }

  @ApiOperation({
    summary: 'Hủy đề xuất giao dịch (Người gửi)',
    description: 'Người khởi tạo đề xuất rút lại yêu cầu khi chưa được phê duyệt.',
  })
  @ApiParam({ name: 'id', description: 'Mã định danh UUID của đề xuất' })
  @Put(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @CurrentUser('nguoi_dung_id') userId: string,
  ) {
    return this.proposalsService.cancelProposal(id, userId);
  }

  @ApiOperation({
    summary: 'Chuyển trạng thái đề xuất sang thương lượng (UC3.3)',
    description: 'Chuyển trạng thái đề xuất sang đang thương lượng để hai bên trao đổi qua kênh tin nhắn trực tiếp.',
  })
  @ApiParam({ name: 'id', description: 'Mã định danh UUID của đề xuất' })
  @Put(':id/negotiate')
  async negotiate(
    @Param('id') id: string,
    @CurrentUser('nguoi_dung_id') userId: string,
  ) {
    return this.proposalsService.startNegotiation(id, userId);
  }

  @ApiOperation({
    summary: 'Gửi tin nhắn thương lượng',
    description: 'Gửi tin nhắn trao đổi trong thương lượng đề xuất giao dịch.',
  })
  @ApiParam({ name: 'id', description: 'Mã định danh UUID của đề xuất' })
  @Post(':id/messages')
  async sendMessage(
    @Param('id') id: string,
    @CurrentUser('nguoi_dung_id') userId: string,
    @Body('noi_dung') noiDung: string,
  ) {
    return this.proposalsService.sendMessage(id, userId, noiDung);
  }

  @ApiOperation({
    summary: 'Lấy lịch sử tin nhắn thương lượng',
    description: 'Truy vấn toàn bộ tin nhắn thương lượng của đề xuất giao dịch.',
  })
  @ApiParam({ name: 'id', description: 'Mã định danh UUID của đề xuất' })
  @Get(':id/messages')
  async getMessages(
    @Param('id') id: string,
    @CurrentUser('nguoi_dung_id') userId: string,
  ) {
    return this.proposalsService.getMessages(id, userId);
  }
}
