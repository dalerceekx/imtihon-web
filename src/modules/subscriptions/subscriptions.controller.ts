import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../core/utils/jwt';
import { SubscriptionsService } from './subscriptions.service';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';

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
  @UseGuards(AuthGuard) // Faqat tizimga kirgan foydalanuvchi obuna sotib ola oladi
  @ApiOperation({ summary: 'Obuna sotib olish (POST /api/subscription/purchase)' })
  @Post('purchase')
  purchase(@CurrentUser() user: JwtPayload, @Body() payload: PurchaseSubscriptionDto) {
    return this.subscriptionsService.purchase(user.id, payload);
  }
}
