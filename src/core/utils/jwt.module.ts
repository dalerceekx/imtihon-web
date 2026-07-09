import { Global, Module } from '@nestjs/common';
import { GenerateToken } from './jwt';

@Global()
@Module({
  providers: [GenerateToken],
  exports: [GenerateToken],
})
export class JwtTokenModule {}
