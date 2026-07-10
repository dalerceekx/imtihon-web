import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role, SubscriptionType } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service';
import { MovieQueryDto } from './dto/movie-query.dto';
import { QUALITY_LABELS } from '../../common/constants/quality.constant';
import type { JwtPayload } from '../../core/utils/jwt';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Kinolar ro'yxatini sahifalash (pagination), qidiruv va filterlar bilan qaytaradi.
   * Query parametrlar: page, limit, category (slug), search (title bo'yicha), subscription_type
   */
  async findAll(query: MovieQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    // Prisma "where" shartini dinamik ravishda quramiz - faqat kiritilgan filterlar qo'shiladi
    const where: Prisma.MovieWhereInput = {
      ...(query.subscription_type && { subscription_type: query.subscription_type }),
      ...(query.search && {
        title: { contains: query.search, mode: 'insensitive' },
      }),
      ...(query.category && {
        categories: { some: { category: { slug: query.category } } },
      }),
    };

    const [movies, total] = await this.prisma.$transaction([
      this.prisma.movie.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { categories: { include: { category: true } } },
      }),
      this.prisma.movie.count({ where }),
    ]);

    return {
      success: true,
      data: {
        movies: movies.map((movie) => ({
          id: movie.id,
          title: movie.title,
          slug: movie.slug,
          poster_url: movie.poster_url,
          release_year: movie.release_year,
          rating: movie.rating,
          subscription_type: movie.subscription_type,
          categories: movie.categories.map((c) => c.category.name),
        })),
        pagination: {
          total,
          page,
          limit,
          pages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    };
  }

  /**
   * Slug bo'yicha bitta kinoning to'liq ma'lumotini qaytaradi.
   * - Har safar ko'rilganda view_count +1 oshadi
   * - Agar kino "premium" bo'lsa va foydalanuvchida faol obuna bo'lmasa, video fayllar ko'rsatilmaydi
   * - currentUser bo'lsa, "is_favorite" maydoni to'g'ri hisoblanadi (OptionalAuthGuard orqali keladi)
   */
  async findBySlug(slug: string, currentUser?: JwtPayload) {
    const movie = await this.prisma.movie.findUnique({
      where: { slug },
      include: {
        categories: { include: { category: true } },
        files: true,
      },
    });

    if (!movie) {
      throw new NotFoundException('Kino topilmadi!');
    }

    // Ko'rishlar sonini oshiramiz (statistik maqsadda)
    await this.prisma.movie.update({
      where: { id: movie.id },
      data: { view_count: { increment: 1 } },
    });

    // Sharhlar bo'yicha o'rtacha baho va sonini hisoblaymiz
    const reviewStats = await this.prisma.review.aggregate({
      where: { movie_id: movie.id },
      _avg: { rating: true },
      _count: { _all: true },
    });

    const [favorite, hasAccess] = await Promise.all([
      currentUser
        ? this.prisma.favorite.findUnique({
            where: { user_id_movie_id: { user_id: currentUser.id, movie_id: movie.id } },
          })
        : null,
      this.checkMovieAccess(movie.subscription_type, currentUser),
    ]);

    const isFavorite = !!favorite;

    return {
      success: true,
      data: {
        id: movie.id,
        title: movie.title,
        slug: movie.slug,
        description: movie.description,
        release_year: movie.release_year,
        duration_minutes: movie.duration_minutes,
        poster_url: movie.poster_url,
        rating: movie.rating,
        subscription_type: movie.subscription_type,
        view_count: movie.view_count,
        is_favorite: isFavorite,
        categories: movie.categories.map((c) => c.category.name),
        // Agar ruxsat bo'lmasa, fayllar ro'yxati bo'sh qaytadi va foydalanuvchiga obuna kerakligi bildiriladi.
        // Ruxsat bo'lsa, video faylning statik manzili to'g'ridan-to'g'ri qaytariladi.
        files: hasAccess
          ? movie.files.map((file) => ({
              id: file.id,
              quality: QUALITY_LABELS[file.quality],
              language: file.language,
              file_url: file.file_url,
            }))
          : [],
        requires_subscription: !hasAccess,
        reviews: {
          average_rating: reviewStats._avg.rating ? Number(reviewStats._avg.rating.toFixed(1)) : 0,
          count: reviewStats._count._all,
        },
      },
    };
  }

  private async checkMovieAccess(
    movieSubscriptionType: SubscriptionType,
    currentUser?: JwtPayload,
  ): Promise<boolean> {
    if (movieSubscriptionType === 'FREE') {
      return true;
    }

    if (!currentUser) {
      return false;
    }

    if (currentUser.role === Role.ADMIN || currentUser.role === Role.SUPERADMIN) {
      return true;
    }

    const activeSubscription = await this.prisma.userSubscription.findFirst({
      where: { user_id: currentUser.id, status: 'ACTIVE', end_date: { gte: new Date() } },
    });

    return !!activeSubscription;
  }
}
