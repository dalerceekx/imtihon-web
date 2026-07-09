import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * RoleGuard - @Roles() dekoratori bilan belgilangan ruxsat etilgan rollar ro'yxatini
 * req.user.role bilan solishtiradi. AuthGuard'dan KEYIN ishlatilishi shart, chunki
 * req.user faqat AuthGuard orqali o'rnatiladi.
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Handler yoki controller darajasida belgilangan ruxsat etilgan rollarni olamiz
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Agar @Roles() umuman qo'yilmagan bo'lsa - hamma autentifikatsiyadan o'tgan userga ruxsat
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const userRole: Role = req.user?.role;

    if (!userRole || !requiredRoles.includes(userRole)) {
      throw new ForbiddenException('Sizda bu amalni bajarish uchun ruxsat yo\'q!');
    }

    return true;
  }
}
