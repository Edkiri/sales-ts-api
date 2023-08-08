import { IsNotEmpty, MaxLength, IsInt, IsOptional } from 'class-validator';

export class CreateSaleDto {
  @IsOptional()
  @MaxLength(255)
  @IsNotEmpty()
  public description?: string;

  @IsOptional()
  @IsInt()
  public clientId?: number;
}
