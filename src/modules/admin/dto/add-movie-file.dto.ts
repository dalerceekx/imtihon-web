import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class AddMovieFileDto {
  // Multipart formda enum to'g'ridan-to'g'ri "720p" kabi matn sifatida keladi,
  // shuning uchun ruxsat etilgan qiymatlar ro'yxati bilan tekshiramiz (@IsIn)
  @ApiProperty({ example: '720p', enum: ['240p', '360p', '480p', '720p', '1080p', '4K'] })
  @IsIn(['240p', '360p', '480p', '720p', '1080p', '4K'])
  quality: string;

  @ApiPropertyOptional({ example: 'uz', default: 'uz' })
  @IsOptional()
  @IsString()
  language?: string;
}
