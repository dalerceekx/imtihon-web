import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Ro\'yxatdan o\'tish ' })
  @Post('register')
  register(@Body() payload: RegisterDto) {
    return this.authService.register(payload);
  }

  @ApiOperation({ summary: 'Tizimga kirish ' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @ApiOperation({ summary: 'Tizimdan chiqish ' })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    return this.authService.logout();
  }
}
