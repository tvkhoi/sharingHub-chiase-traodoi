import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @ApiOperation({
    summary: 'Truy vấn danh sách giao dịch cá nhân (UC4.3)',
    description: 'Trả về toàn bộ các bản ghi giao dịch mà người dùng tham gia với vai trò bên sở hữu hoặc bên tiếp nhận.',
  })
  @Get()
  async findAll(@CurrentUser('nguoi_dung_id') userId: string) {
    return this.transactionsService.findAllMyTransactions(userId);
  }

  @ApiOperation({
    summary: 'Truy vấn chi tiết bản ghi giao dịch (UC4.3)',
    description: 'Trả về chi tiết trạng thái, thông tin hai bên tham gia và lịch sử xác nhận của một giao dịch.',
  })
  @ApiParam({ name: 'id', description: 'Mã định danh UUID của giao dịch' })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('nguoi_dung_id') userId: string,
  ) {
    return this.transactionsService.findOne(id, userId);
  }

  @ApiOperation({
    summary: 'Xác nhận hoàn tất giao dịch hai bên (UC4.1)',
    description: 'Bên sở hữu xác nhận đã bàn giao hoặc bên tiếp nhận xác nhận đã nhận tài sản. Khi cả hai bên cùng xác nhận, giao dịch tự động chuyển sang trạng thái HOAN_TAT.',
  })
  @ApiParam({ name: 'id', description: 'Mã định danh UUID của giao dịch' })
  @Put(':id/confirm')
  async confirm(
    @Param('id') id: string,
    @CurrentUser('nguoi_dung_id') userId: string,
  ) {
    return this.transactionsService.confirmTransaction(id, userId);
  }

  @ApiOperation({
    summary: 'Hủy bỏ tiến trình giao dịch (UC4.2)',
    description: 'Hủy bỏ giao dịch đang trong tiến trình xử lý. Tự động giải phóng hoặc hoàn trả số lượng tài sản khả dụng.',
  })
  @ApiParam({ name: 'id', description: 'Mã định danh UUID của giao dịch' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['ly_do'],
      properties: {
        ly_do: {
          type: 'string',
          example: 'Thay đổi kế hoạch công tác nên không thể đến nhận tài sản trực tiếp',
          description: 'Lý do thực hiện hủy bỏ giao dịch',
        },
      },
    },
  })
  @Put(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @CurrentUser('nguoi_dung_id') userId: string,
    @Body('ly_do') lyDo: string,
  ) {
    return this.transactionsService.cancelTransaction(id, userId, lyDo);
  }
}
