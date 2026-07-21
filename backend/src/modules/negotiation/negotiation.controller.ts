import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { NegotiationService } from './negotiation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Negotiation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/proposals/:proposalId/messages')
export class NegotiationController {
  constructor(private negotiationService: NegotiationService) {}

  @ApiOperation({
    summary: 'Truy vấn lịch sử tin nhắn thương lượng (UC3.3)',
    description: 'Trả về toàn bộ danh sách các tin nhắn trao đổi trong tiến trình thương lượng của một đề xuất.',
  })
  @ApiParam({ name: 'proposalId', description: 'Mã định danh UUID của đề xuất giao dịch' })
  @Get()
  async getMessages(
    @Param('proposalId') proposalId: string,
    @CurrentUser('nguoi_dung_id') userId: string,
  ) {
    return this.negotiationService.getMessages(proposalId, userId);
  }

  @ApiOperation({
    summary: 'Gửi tin nhắn thương lượng trực tiếp (UC3.3)',
    description: 'Gửi tin nhắn mới tới đối phương liên quan tới đề xuất giao dịch đang thương lượng.',
  })
  @ApiParam({ name: 'proposalId', description: 'Mã định danh UUID của đề xuất giao dịch' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['noi_dung'],
      properties: {
        noi_dung: {
          type: 'string',
          example: 'Tôi có thể đến nhận tài sản trực tiếp vào lúc 17h chiều nay được không?',
          description: 'Nội dung tin nhắn thương lượng',
        },
      },
    },
  })
  @Post()
  async sendMessage(
    @Param('proposalId') proposalId: string,
    @CurrentUser('nguoi_dung_id') userId: string,
    @Body('noi_dung') noiDung: string,
  ) {
    return this.negotiationService.createMessage(proposalId, userId, noiDung);
  }
}
