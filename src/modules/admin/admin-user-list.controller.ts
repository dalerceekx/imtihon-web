import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminUsersService } from './admin-users.service';
import { ListUsersQueryDto } from './dto/list-users-query.dto';

@ApiTags('Admin - Users')
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN)
@Controller('admin/users')
export class AdminUserListController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @ApiOperation({
    summary:
      "Barcha foydalanuvchilar ro'yxati - roli (statusi) va obuna holati bilan",
  })
  @Get()
  findAll(@Query() query: ListUsersQueryDto) {
    return this.adminUsersService.listUsers(query);
  }
}
