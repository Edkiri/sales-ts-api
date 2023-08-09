import {
  IsNotEmpty,
  MaxLength,
  IsInt,
  IsOptional,
  IsArray,
} from 'class-validator';
import { CreateOrderDto } from './orders.dto';

export class CreateSaleDto {
  @IsOptional()
  @MaxLength(255)
  @IsNotEmpty()
  public description?: string;

  @IsOptional()
  @IsInt()
  public clientId?: number;

  @IsArray()
  orders!: CreateOrderDto[];
}
