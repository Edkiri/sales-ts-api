import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @MinLength(4)
  name!: string;
}

export class UpdateAccountDto {
  @IsOptional()
  name?: string;
}
