import { Currency } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @MinLength(4)
  name!: string;

  @IsNumber()
  amount?: number;

  @IsEnum(Currency)
  currency!: Currency;
}

export class UpdateAccountDto {
  @IsOptional()
  name?: string;

  @IsNumber()
  amount?: number;
}
