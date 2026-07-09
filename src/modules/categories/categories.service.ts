import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { toSlug } from '../../common/utils/slug.util';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({ orderBy: { name: 'asc' } });

    return {
      success: true,
      data: categories,
    };
  }

  async create(payload: CreateCategoryDto) {
    const slug = toSlug(payload.name);

    const exists = await this.prisma.category.findUnique({ where: { slug } });
    if (exists) {
      throw new ConflictException('Bu nomdagi kategoriya allaqachon mavjud!');
    }

    const category = await this.prisma.category.create({
      data: { name: payload.name, slug, description: payload.description },
    });

    return {
      success: true,
      message: 'Kategoriya muvaffaqiyatli yaratildi',
      data: category,
    };
  }

  async update(id: string, payload: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Kategoriya topilmadi!');
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        name: payload.name,
        description: payload.description,
        ...(payload.name && { slug: toSlug(payload.name) }),
      },
    });

    return {
      success: true,
      message: 'Kategoriya muvaffaqiyatli yangilandi',
      data: updated,
    };
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Kategoriya topilmadi!');
    }

    await this.prisma.category.delete({ where: { id } });

    return {
      success: true,
      message: 'Kategoriya muvaffaqiyatli o\'chirildi',
    };
  }
}
