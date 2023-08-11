import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price!: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  productId!: number;
}
