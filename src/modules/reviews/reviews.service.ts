import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  // Kinoga sharh va baho qo'shadi. Har bir foydalanuvchi bir kinoga faqat bitta sharh yoza oladi
  async create(userId: string, movieId: string, payload: CreateReviewDto) {
    const movie = await this.prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) {
      throw new NotFoundException('Kino topilmadi!');
    }

    const existingReview = await this.prisma.review.findFirst({
      where: { movie_id: movieId, user_id: userId },
    });
    if (existingReview) {
      throw new ConflictException('Siz bu kinoga allaqachon sharh qoldirgansiz!');
    }

    const review = await this.prisma.review.create({
      data: {
        user_id: userId,
        movie_id: movieId,
        rating: payload.rating,
        comment: payload.comment,
      },
      include: { user: { select: { id: true, username: true } } },
    });

    // Sharh qo'shilgandan so'ng kinoning umumiy reytingini qayta hisoblaymiz
    await this.recalculateMovieRating(movieId);

    return {
      success: true,
      message: 'Sharh muvaffaqiyatli qo\'shildi',
      data: {
        id: review.id,
        user: { id: review.user.id, username: review.user.username },
        movie_id: review.movie_id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
      },
    };
  }

  // Kinoning barcha sharhlarini id'lari bilan qaytaradi
  async findAll(movieId: string) {
    const movie = await this.prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) {
      throw new NotFoundException('Kino topilmadi!');
    }

    const reviews = await this.prisma.review.findMany({
      where: { movie_id: movieId },
      include: { user: { select: { id: true, username: true } } },
      orderBy: { created_at: 'desc' },
    });

    return {
      success: true,
      data: reviews.map((review) => ({
        id: review.id,
        user: { id: review.user.id, username: review.user.username },
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
      })),
    };
  }

  /**
   * Sharhni o'chiradi. Faqat sharh egasi yoki admin/superadmin
   * (moderatsiya huquqiga ega bo'lgani uchun) o'chira oladi.
   */
  async remove(userId: string, userRole: Role, movieId: string, reviewId: string) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, movie_id: movieId },
    });

    if (!review) {
      throw new NotFoundException('Sharh topilmadi!');
    }

    const isOwner = review.user_id === userId;
    const isModerator = userRole === Role.ADMIN || userRole === Role.SUPERADMIN;

    if (!isOwner && !isModerator) {
      throw new ForbiddenException('Siz faqat o\'zingizning sharhingizni o\'chira olasiz!');
    }

    await this.prisma.review.delete({ where: { id: reviewId } });
    await this.recalculateMovieRating(movieId);

    return {
      success: true,
      message: 'Sharh muvaffaqiyatli o\'chirildi',
    };
  }

  // Kinoning barcha sharhlari asosida o'rtacha reytingni qayta hisoblab, movies.rating ga yozadi
  private async recalculateMovieRating(movieId: string) {
    const stats = await this.prisma.review.aggregate({
      where: { movie_id: movieId },
      _avg: { rating: true },
    });

    await this.prisma.movie.update({
      where: { id: movieId },
      data: { rating: stats._avg.rating ?? 0 },
    });
  }
}
