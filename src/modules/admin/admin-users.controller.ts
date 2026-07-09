import { Body, Controller, Delete, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminUsersService } from './admin-users.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

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

  @ApiOperation({ summary: 'Adminni yangilash (PUT /api/admin/admins/:id)' })
  @Put(':id')
  update(@Param('id') id: string, @Body() payload: UpdateAdminDto) {
    return this.adminUsersService.updateAdmin(id, payload);
  }

  @ApiOperation({ summary: 'Adminni o\'chirish (DELETE /api/admin/admins/:id)' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminUsersService.removeAdmin(id);
  }
}