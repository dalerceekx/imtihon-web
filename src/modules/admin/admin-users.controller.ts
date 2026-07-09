import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminUsersService } from './admin-users.service';
import { CreateAdminDto } from './dto/create-admin.dto';

@ApiTags('Admin - Users')
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard)
@Roles(Role.SUPERADMIN)
@Controller('admin/admins')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @ApiOperation({ summary: 'Yangi admin qo\'shish (POST /api/admin/admins)' })
  @Post()
  create(@Body() payload: CreateAdminDto) {
    return this.adminUsersService.createAdmin(payload);
  }
}