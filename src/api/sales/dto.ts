import {
  IsNotEmpty,
  MaxLength,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { CreateOrderDto } from '../orders/dto';
import { Type } from 'class-transformer';
import { CreatePaymentDto } from '../payments/dto';

export class CreateSaleDto {
  @IsOptional()
  @MaxLength(255)
  @IsNotEmpty()
  public description?: string;

  @IsOptional()
  @IsInt()
  public clientId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDto)
  orders!: CreateOrderDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentDto)
  payments?: CreatePaymentDto[];
}

export class UpdateSaleDto {
  @IsOptional()
  @MaxLength(255)
  @IsNotEmpty()
  public description?: string;
}
