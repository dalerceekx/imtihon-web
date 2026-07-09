import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GenerateToken } from '../../core/utils/jwt';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly generateToken: GenerateToken) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers?.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : undefined;

    if (token) {
      try {
        req.user = await this.generateToken.verifyToken(token);
      } catch {
      }
    }

    return true;
  }
}
