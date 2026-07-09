import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class AddMovieFileDto {
  @ApiProperty({ example: '720p', enum: ['240p', '360p', '480p', '720p', '1080p', '4K'] })
  @IsIn(['240p', '360p', '480p', '720p', '1080p', '4K'])
  quality!: string;

  @ApiPropertyOptional({ example: 'uz', default: 'uz' })
  @IsOptional()
  @IsString()
  language?: string;
}
