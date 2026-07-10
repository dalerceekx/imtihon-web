import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';
import { CreatePlanDto } from './dto/create-plan.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

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

  // Foydalanuvchining o'zining joriy (faol) obunasi va butun obunalar tarixini qaytaradi
  async getMySubscription(userId: string) {
    const [active, history] = await this.prisma.$transaction([
      this.prisma.userSubscription.findFirst({
        where: { user_id: userId, status: 'ACTIVE', end_date: { gte: new Date() } },
        include: { plan: true },
        orderBy: { end_date: 'desc' },
      }),
      this.prisma.userSubscription.findMany({
        where: { user_id: userId },
        include: { plan: true },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    const now = new Date();
    // DB'da muddati o'tgan obunalar hali "ACTIVE" bo'lib turishi mumkin (avtomatik EXPIRED qilib
    // qo'yadigan cron job yo'q), shuning uchun ko'rsatish uchun haqiqiy holatini shu yerda hisoblaymiz
    const effectiveStatus = (sub: (typeof history)[number]) =>
      sub.status === 'ACTIVE' && sub.end_date && sub.end_date < now ? 'EXPIRED' : sub.status;

    return {
      success: true,
      data: {
        has_active_subscription: !!active,
        active: active
          ? {
              id: active.id,
              plan: {
                id: active.plan.id,
                name: active.plan.name,
                price: active.plan.price,
                duration_days: active.plan.duration_days,
              },
              start_date: active.start_date,
              end_date: active.end_date,
              status: active.status,
              auto_renew: active.auto_renew,
              days_remaining: active.end_date
                ? Math.max(0, Math.ceil((active.end_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
                : null,
            }
          : null,
        history: history.map((sub) => ({
          id: sub.id,
          plan: { id: sub.plan.id, name: sub.plan.name },
          start_date: sub.start_date,
          end_date: sub.end_date,
          status: effectiveStatus(sub),
          auto_renew: sub.auto_renew,
        })),
      },
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
