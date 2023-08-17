import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsNumber()
  @IsPositive()
  rate!: number;

  @IsNumber()
  @IsPositive()
  productId!: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  saleId?: number;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  rate?: number;
}
