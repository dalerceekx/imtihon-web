import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Trim } from '../../../common/decorators/trim.decorator';

export class CreateAdminDto {
  @ApiProperty({ example: 'yangi_admin' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username!: string;

  @ApiProperty({ example: 'admin2@kinolar.uz' })
  @Trim()
  @IsEmail({}, { message: 'Email formati noto\'g\'ri' })
  email!: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString()
  @MinLength(8, { message: 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak' })
  @MaxLength(64)
  password!: string;
}