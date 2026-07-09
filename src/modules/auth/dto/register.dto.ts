import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Trim } from '../../../common/decorators/trim.decorator';

export class RegisterDto {
  @ApiProperty({ example: 'alijon' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username!: string;

  @ApiProperty({ example: 'alijon@example.com' })
  @Trim()
  @IsEmail({}, { message: 'Email formati noto\'g\'ri' })
  email!: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @MinLength(8, { message: 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak' })
  @MaxLength(64)
  password!: string;

  @ApiProperty({ example: 'Ali Valiev', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  full_name?: string;

  @ApiProperty({ example: '+998901234567', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ example: 'Uzbekistan', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  country?: string;
}
