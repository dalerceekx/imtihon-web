import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddFavoriteDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440021' })
  @IsUUID()
  movie_id!: string;
}
