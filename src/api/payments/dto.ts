import { Currency, PaymentMethod, PaymentType } from '@prisma/client';
import { IsNumber, IsOptional, IsEnum, IsPositive } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsNumber()
  @IsPositive()
  rate!: number;

  @IsEnum(Object.values(PaymentMethod))
  method!: PaymentMethod;

  @IsEnum(Object.values(Currency))
  currency!: Currency;

  @IsEnum(Object.values(PaymentType))
  type!: PaymentType;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  saleId?: number;

  @IsNumber()
  @IsPositive()
  accountId!: number;
}

export class UpdatePaymentDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  rate?: number;

  @IsOptional()
  @IsEnum(Object.values(PaymentMethod))
  method?: PaymentMethod;

  @IsOptional()
  @IsEnum(Object.values(Currency))
  currency?: Currency;

  @IsOptional()
  @IsEnum(Object.values(PaymentType))
  type?: PaymentType;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  accountId?: number;
}
