import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../core/utils/jwt';

/**
 * @CurrentUser() dekoratori - AuthGuard tomonidan req.user ga yozilgan
 * JWT payload'ni (id va role) controller metodiga to'g'ridan-to'g'ri parametr sifatida olib beradi.
 * Masalan: findAll(@CurrentUser() user: JwtPayload)
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    return data ? user?.[data] : user;
  },
);
