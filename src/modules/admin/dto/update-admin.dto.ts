import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAdminDto {
  @ApiPropertyOptional({ example: 'new_admin' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ example: 'admin@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'NewStrongPassword123!' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
