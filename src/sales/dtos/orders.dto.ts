import { IsNumber, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsNumber()
  quantity!: number;

  @IsOptional()
  @IsNumber()
  price!: number;

  @IsOptional()
  @IsNumber()
  productId!: number;
}
