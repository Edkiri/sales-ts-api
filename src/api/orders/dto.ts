import { IsNumber, IsPositive } from 'class-validator';

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
}

export class UpdateOrderDto {
  @IsNumber()
  @IsPositive()
  quantity?: number;

  @IsNumber()
  @IsPositive()
  price?: number;
}
