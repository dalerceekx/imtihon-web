import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../core/utils/jwt';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(AuthGuard) 
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOperation({ summary: 'Joriy foydalanuvchi profilini olish' })
  @Get()
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.profileService.getMyProfile(user.id);
  }

  @ApiOperation({ summary: 'Profilni yangilash ' })
  @Put()
  updateProfile(@CurrentUser() user: JwtPayload, @Body() payload: UpdateProfileDto) {
    return this.profileService.updateMyProfile(user.id, payload);
  }
}
