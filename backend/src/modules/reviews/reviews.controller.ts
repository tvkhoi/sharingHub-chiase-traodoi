import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Reviews')
@Controller('api/v1/reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @ApiOperation({
    summary: 'Khởi tạo đánh giá chất lượng giao dịch (UC6.1)',
    description: 'Gửi đánh giá số sao (1-5) và nhận xét cho đối phương sau khi giao dịch chuyển sang trạng thái HOAN_TAT. Tự động tính toán lại điểm uy tín tích lũy của thành viên.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async createReview(
    @CurrentUser('nguoi_dung_id') userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(userId, dto);
  }

  @ApiOperation({
    summary: 'Truy vấn danh sách đánh giá của thành viên (UC6.2)',
    description: 'Trả về toàn bộ danh sách các nhận xét và đánh giá sao mà thành viên được nhận từ các đối tác giao dịch.',
  })
  @ApiParam({ name: 'id', description: 'Mã định danh UUID của người dùng' })
  @Get('user/:id')
  async getUserReviews(@Param('id') userId: string) {
    return this.reviewsService.getUserReviews(userId);
  }
}
