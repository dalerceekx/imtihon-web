import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { Trim } from '../../../common/decorators/trim.decorator';

export class UpdateAdminDto {
  @ApiPropertyOptional({ example: 'new_admin' })
  @IsOptional()
  @Trim()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ example: 'admin@example.com' })
  @IsOptional()
  @Trim()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'NewStrongPassword123!' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
