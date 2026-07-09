import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

const parseCategoryIds = ({ value }: { value: unknown }) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return [value];
    }
  }
  return value;
};

export class CreateMovieDto {
  @ApiProperty({ example: 'Yangi Film' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Film ta\'rifi' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 2024 })
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  release_year!: number;

  @ApiProperty({ example: 120 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration_minutes!: number;

  @ApiPropertyOptional({ enum: SubscriptionType, default: SubscriptionType.FREE })
  @IsOptional()
  @IsEnum(SubscriptionType)
  subscription_type?: SubscriptionType;

  @ApiPropertyOptional({ type: [String], example: ['id1', 'id2'] })
  @IsOptional()
  @Transform(parseCategoryIds)
  @IsArray()
  @IsUUID('all', { each: true })
  category_ids?: string[];
}
