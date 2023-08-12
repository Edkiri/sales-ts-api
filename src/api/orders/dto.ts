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
  productId!: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  saleId?: number;
}

export class UpdateOrderDto {
  @IsNumber()
  @IsPositive()
  quantity?: number;

  @IsNumber()
  @IsPositive()
  price?: number;
}
