import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * @Roles(Role.ADMIN, Role.SUPERADMIN) dekoratori orqali controller yoki
 * bitta endpoint uchun qaysi rollarga ruxsat berilganini belgilaymiz.
 * Buni RoleGuard o'qib, foydalanuvchi rolini tekshiradi.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
