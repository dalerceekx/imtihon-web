import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { AddMovieFileDto } from './dto/add-movie-file.dto';
import { toSlug } from '../../common/utils/slug.util';
import { LABEL_TO_QUALITY, QUALITY_LABELS } from '../../common/constants/quality.constant';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const movies = await this.prisma.movie.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        creator: { select: { username: true } },
        _count: { select: { reviews: true } },
      },
    });

    return {
      success: true,
      data: {
        movies: movies.map((movie) => ({
          id: movie.id,
          title: movie.title,
          slug: movie.slug,
          release_year: movie.release_year,
          subscription_type: movie.subscription_type,
          view_count: movie.view_count,
          review_count: movie._count.reviews,
          created_at: movie.created_at,
          created_by: movie.creator.username,
        })),
        total: movies.length,
      },
    };
  }

  async create(payload: CreateMovieDto, adminId: string, posterFilename?: string) {
    const slug = await this.generateUniqueSlug(payload.title);

    const movie = await this.prisma.movie.create({
      data: {
        title: payload.title,
        slug,
        description: payload.description,
        release_year: payload.release_year,
        duration_minutes: payload.duration_minutes,
        subscription_type: payload.subscription_type ?? 'FREE',
        poster_url: posterFilename ? `/uploads/posters/${posterFilename}` : undefined,
        created_by: adminId,
        ...(payload.category_ids?.length && {
          categories: {
            create: payload.category_ids.map((categoryId) => ({ category_id: categoryId })),
          },
        }),
      },
    });

    return {
      success: true,
      message: 'Yangi kino muvaffaqiyatli qo\'shildi',
      data: {
        id: movie.id,
        title: movie.title,
        slug: movie.slug,
        created_at: movie.created_at,
      },
    };
  }

  async update(movieId: string, payload: UpdateMovieDto) {
    const movie = await this.prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) {
      throw new NotFoundException('Kino topilmadi!');
    }

    if (payload.category_ids) {
      await this.prisma.movieCategory.deleteMany({ where: { movie_id: movieId } });
    }

    const updated = await this.prisma.movie.update({
      where: { id: movieId },
      data: {
        title: payload.title,
        description: payload.description,
        release_year: payload.release_year,
        duration_minutes: payload.duration_minutes,
        subscription_type: payload.subscription_type,
        ...(payload.category_ids && {
          categories: {
            create: payload.category_ids.map((categoryId) => ({ category_id: categoryId })),
          },
        }),
      },
    });

    return {
      success: true,
      message: 'Kino muvaffaqiyatli yangilandi',
      data: {
        id: updated.id,
        title: updated.title,
        updated_at: updated.updated_at,
      },
    };
  }

  async remove(movieId: string) {
    const movie = await this.prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) {
      throw new NotFoundException('Kino topilmadi!');
    }

    await this.prisma.movie.delete({ where: { id: movieId } });

    return {
      success: true,
      message: 'Kino muvaffaqiyatli o\'chirildi',
    };
  }

  async addFile(movieId: string, payload: AddMovieFileDto, file: Express.Multer.File) {
    const movie = await this.prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) {
      throw new NotFoundException('Kino topilmadi!');
    }

    const fileUrl = `/uploads/movies/${file.filename}`;

    const movieFile = await this.prisma.movieFile.create({
      data: {
        movie_id: movieId,
        file_url: fileUrl,
        quality: LABEL_TO_QUALITY[payload.quality],
        language: payload.language ?? 'uz',
      },
    });

    return {
      success: true,
      message: 'Kino fayli muvaffaqiyatli yuklandi',
      data: {
        id: movieFile.id,
        movie_id: movieFile.movie_id,
        quality: QUALITY_LABELS[movieFile.quality],
        language: movieFile.language,
        size_mb: Math.round(file.size / (1024 * 1024)),
        file_url: movieFile.file_url,
      },
    };
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = toSlug(title);
    let slug = baseSlug;
    let attempt = 0;

    while (await this.prisma.movie.findUnique({ where: { slug } })) {
      attempt += 1;
      slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
      if (attempt > 10) break; // cheksiz aylanishning oldini olish
    }

    return slug;
  }
}
