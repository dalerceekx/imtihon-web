import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../common/decorators/trim.decorator';

export class LoginDto {
  @ApiProperty({ example: 'alijon@example.com' })
  @Trim()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
