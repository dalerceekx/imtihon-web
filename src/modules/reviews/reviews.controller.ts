import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../core/utils/jwt';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@ApiTags('Reviews')
@ApiBearerAuth()
@UseGuards(AuthGuard) // Sharh qoldirish/o'chirish uchun tizimga kirgan bo'lish shart
@Controller('movies/:movie_id/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: 'Kinoga sharh qoldirish (POST /api/movies/:movie_id/reviews)' })
  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Param('movie_id') movieId: string,
    @Body() payload: CreateReviewDto,
  ) {
    return this.reviewsService.create(user.id, movieId, payload);
  }

  @ApiOperation({
    summary: 'Kino sharhlari ro\'yxati (GET /api/movies/:movie_id/reviews)',
  })
  @Get()
  findAll(@Param('movie_id') movieId: string) {
    return this.reviewsService.findAll(movieId);
  }

  @ApiOperation({
    summary: 'Sharhni o\'chirish (DELETE /api/movies/:movie_id/reviews/:review_id)',
  })
  @Delete(':review_id')
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('movie_id') movieId: string,
    @Param('review_id') reviewId: string,
  ) {
    return this.reviewsService.remove(user.id, user.role, movieId, reviewId);
  }
}
