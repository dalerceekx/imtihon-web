import { Body, Controller, Delete, Get, Post, Param, UseGuards } from '@nestjs/common';
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

@ApiTags('Subscriptions')
@Controller('subscription')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @ApiOperation({ summary: 'Barcha obuna rejalarini olish (GET /api/subscription/plans) - ochiq' })
  @Get('plans')
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: "Yangi obuna rejasini qo'shish (POST /api/subscription/plans) - Superadmin" })
  @Post('plans')
  createPlan(@Body() payload: CreatePlanDto) {
    return this.subscriptionsService.createPlan(payload);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: "Obuna rejasini o'chirish (DELETE /api/subscription/plans/:id) - Superadmin" })
  @Delete('plans/:id')
  removePlan(@Param('id') id: string) {
    return this.subscriptionsService.removePlan(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard) // Faqat tizimga kirgan foydalanuvchi obuna sotib ola oladi
  @ApiOperation({ summary: 'Obuna sotib olish (POST /api/subscription/purchase)' })
  @Post('purchase')
  purchase(@CurrentUser() user: JwtPayload, @Body() payload: PurchaseSubscriptionDto) {
    return this.subscriptionsService.purchase(user.id, payload);
  }
}
