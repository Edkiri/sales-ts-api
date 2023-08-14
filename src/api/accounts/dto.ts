import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Currencies } from '../../enums/currencies.enum';

export class CreateAccountDto {
  @IsString()
  @MinLength(4)
  name!: string;

  @IsNumber()
  amount?: number;

  @IsEnum(Currencies)
  currency!: Currencies;
}

export class UpdateAccountDto {
  @IsOptional()
  name?: string;

  @IsNumber()
  amount?: number;
}
