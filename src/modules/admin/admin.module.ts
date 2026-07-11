import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminUserListController } from './admin-user-list.controller';
import { AdminUsersService } from './admin-users.service';

@Module({
  controllers: [AdminController, AdminUsersController, AdminUserListController],
  providers: [AdminService, AdminUsersService],
})
export class AdminModule {}