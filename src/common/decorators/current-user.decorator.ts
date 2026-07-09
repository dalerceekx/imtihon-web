import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../core/utils/jwt';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    return data ? user?.[data] : user;
  },
);
