import { Body, Controller, Delete, Get, Post, Put, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Role } from '@prisma/client';
import { RoleGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../core/utils/jwt';
import { SubscriptionsService } from './subscriptions.service';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@ApiTags('Subscriptions')
@Controller('subscription')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @ApiOperation({ summary: 'Barcha obuna rejalarini olish - ochiq' })
  @Get('plans')
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "O'zining obunasi haqida ma'lumot" })
  @Get('my')
  getMySubscription(@CurrentUser() user: JwtPayload) {
    return this.subscriptionsService.getMySubscription(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: "Yangi obuna rejasini qo'shish - Superadmin" })
  @Post('plans')
  createPlan(@Body() payload: CreatePlanDto) {
    return this.subscriptionsService.createPlan(payload);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Obuna rejasini yangilash - Superadmin' })
  @Put('plans/:id')
  updatePlan(@Param('id') id: string, @Body() payload: UpdatePlanDto) {
    return this.subscriptionsService.updatePlan(id, payload);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: "Obuna rejasini o'chirish - Superadmin" })
  @Delete('plans/:id')
  removePlan(@Param('id') id: string) {
    return this.subscriptionsService.removePlan(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Obuna sotib olish' })
  @Post('purchase')
  purchase(@CurrentUser() user: JwtPayload, @Body() payload: PurchaseSubscriptionDto) {
    return this.subscriptionsService.purchase(user.id, payload);
  }
}
