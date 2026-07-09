import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  // Foydalanuvchining barcha sevimli kinolarini qaytaradi
  async findAll(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { user_id: userId },
      include: { movie: true },
      orderBy: { created_at: 'desc' },
    });

    return {
      success: true,
      data: {
        movies: favorites.map((f) => ({
          id: f.movie.id,
          title: f.movie.title,
          slug: f.movie.slug,
          poster_url: f.movie.poster_url,
          release_year: f.movie.release_year,
          rating: f.movie.rating,
          subscription_type: f.movie.subscription_type,
        })),
        total: favorites.length,
      },
    };
  }

  // Kinoni sevimlilar ro'yxatiga qo'shadi (bir xil kino ikki marta qo'shilmasligi kerak)
  async add(userId: string, movieId: string) {
    const movie = await this.prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) {
      throw new NotFoundException('Kino topilmadi!');
    }

    const exists = await this.prisma.favorite.findUnique({
      where: { user_id_movie_id: { user_id: userId, movie_id: movieId } },
    });
    if (exists) {
      throw new ConflictException('Bu kino allaqachon sevimlilar ro\'yxatida!');
    }

    const favorite = await this.prisma.favorite.create({
      data: { user_id: userId, movie_id: movieId },
    });

    return {
      success: true,
      message: 'Kino sevimlilar ro\'yxatiga qo\'shildi',
      data: {
        id: favorite.id,
        movie_id: movie.id,
        movie_title: movie.title,
        created_at: favorite.created_at,
      },
    };
  }

  // Kinoni sevimlilar ro'yxatidan o'chiradi
  async remove(userId: string, movieId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { user_id_movie_id: { user_id: userId, movie_id: movieId } },
    });

    if (!favorite) {
      throw new NotFoundException('Bu kino sevimlilar ro\'yxatida topilmadi!');
    }

    await this.prisma.favorite.delete({ where: { id: favorite.id } });

    return {
      success: true,
      message: 'Kino sevimlilar ro\'yxatidan o\'chirildi',
    };
  }
}
