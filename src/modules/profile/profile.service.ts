import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { user_id: userId },
      include: { user: { select: { avatar_url: true } } },
    });

    if (!profile) {
      throw new NotFoundException('Profil topilmadi!');
    }

    return {
      success: true,
      data: {
        user_id: profile.user_id,
        full_name: profile.full_name,
        phone: profile.phone,
        country: profile.country,
        created_at: profile.created_at,
        avatar_url: profile.user.avatar_url,
      },
    };
  }

  async updateMyProfile(userId: string, payload: UpdateProfileDto) {
    const profile = await this.prisma.profile.update({
      where: { user_id: userId },
      data: payload,
    });

    return {
      success: true,
      message: 'Profil muvaffaqiyatli yangilandi',
      data: {
        user_id: profile.user_id,
        full_name: profile.full_name,
        phone: profile.phone,
        country: profile.country,
        updated_at: new Date(),
      },
    };
  }
}
