import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { IsBoolean, IsEnum, IsObject, IsOptional, IsUUID } from 'class-validator';

export class PurchaseSubscriptionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  @IsUUID()
  plan_id!: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CARD })
  @IsEnum(PaymentMethod)
  payment_method!: PaymentMethod;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  auto_renew?: boolean;


  @ApiPropertyOptional({
    example: { card_number: '4242XXXXXXXX4242', expiry: '04/26', card_holder: 'Falonchayev Faloncha' },
  })
  @IsOptional()
  @IsObject()
  payment_details?: Record<string, any>;
}
