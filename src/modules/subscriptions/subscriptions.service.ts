import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';
import { CreatePlanDto } from './dto/create-plan.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  // Faol (is_active=true) barcha obuna rejalarini ro'yxatini qaytaradi (Free, Premium va h.k.)
  async getPlans() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { is_active: true },
      orderBy: { price: 'asc' },
    });

    return {
      success: true,
      data: plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        duration_days: plan.duration_days,
        features: plan.features,
      })),
    };
  }

  async createPlan(payload: CreatePlanDto) {
    // Prevent duplicate active plan names
    const exists = await this.prisma.subscriptionPlan.findFirst({ where: { name: payload.name } });
    if (exists && exists.is_active) {
      throw new ConflictException('Bu nom bilan faol reja allaqachon mavjud!');
    }

    const plan = await this.prisma.subscriptionPlan.create({
      data: {
        name: payload.name,
        price: payload.price,
        duration_days: payload.duration_days,
        features: payload.features ?? {},
        is_active: payload.is_active ?? true,
      },
    });

    return {
      success: true,
      message: 'Obuna rejasi yaratildi',
      data: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        duration_days: plan.duration_days,
      },
    };
  }

  async removePlan(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Reja topilmadi!');
    }

    const usageCount = await this.prisma.userSubscription.count({ where: { plan_id: id } });
    if (usageCount > 0) {
      throw new ConflictException(`Bu rejaga ${usageCount} ta foydalanuvchi obuna - avval ularni bekor qiling yoki reja almashshtiring.`);
    }

    await this.prisma.subscriptionPlan.delete({ where: { id } });

    return { success: true, message: 'Reja muvaffaqiyatli o\'chirildi' };
  }

  /**
   * Foydalanuvchi tanlagan obuna rejasini sotib oladi.
   * Bu yerda haqiqiy to'lov tizimi (Stripe/Payme/Click) o'rniga soddalashtirilgan
   * simulyatsiya qilingan: to'lov darhol "completed" deb belgilanadi.
   * Haqiqiy loyihada bu joyga tashqi to'lov provayderi bilan integratsiya qo'shiladi.
   */
  async purchase(userId: string, payload: PurchaseSubscriptionDto) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: payload.plan_id } });

    if (!plan || !plan.is_active) {
      throw new NotFoundException('Obuna rejasi topilmadi yoki faol emas!');
    }

    if (Number(plan.price) < 0) {
      throw new BadRequestException('Reja narxi noto\'g\'ri!');
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.duration_days);

    // Tranzaksiya ichida obuna va to'lov yozuvlarini birgalikda yaratamiz -
    // shu orqali ikkalasi ham yoki yaratiladi, yoki xato bo'lsa hech biri saqlanmaydi
    const result = await this.prisma.$transaction(async (tx) => {
      const subscription = await tx.userSubscription.create({
        data: {
          user_id: userId,
          plan_id: plan.id,
          start_date: startDate,
          end_date: endDate,
          status: 'ACTIVE',
          auto_renew: payload.auto_renew ?? false,
        },
      });

      const payment = await tx.payment.create({
        data: {
          user_subscription_id: subscription.id,
          amount: plan.price,
          payment_method: payload.payment_method,
          payment_details: payload.payment_details ?? {},
          status: 'COMPLETED',
          external_transaction_id: `txn_${Date.now()}`,
        },
      });

      return { subscription, payment };
    });

    return {
      success: true,
      message: 'Obuna muvaffaqiyatli sotib olindi',
      data: {
        subscription: {
          id: result.subscription.id,
          plan: { id: plan.id, name: plan.name },
          start_date: result.subscription.start_date,
          end_date: result.subscription.end_date,
          status: result.subscription.status,
          auto_renew: result.subscription.auto_renew,
        },
        payment: {
          id: result.payment.id,
          amount: result.payment.amount,
          status: result.payment.status,
          external_transaction_id: result.payment.external_transaction_id,
          payment_method: result.payment.payment_method,
        },
      },
    };
  }
}
