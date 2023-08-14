import { IsNumber, IsOptional, IsEnum, IsPositive } from 'class-validator';
import { Currencies } from '../../enums/currencies.enum';
import { PaymentMethods } from '../../enums/payment-methods.enum';

export class CreatePaymentDto {
  @IsNumber()
  amount!: number;

  @IsNumber()
  @IsPositive()
  rate!: number;

  @IsEnum(PaymentMethods)
  method!: PaymentMethods;

  @IsEnum(Currencies)
  currency!: Currencies;

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
  @IsEnum(PaymentMethods)
  method?: PaymentMethods;
}
