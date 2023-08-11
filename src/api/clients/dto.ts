import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateClientDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  public email?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @MinLength(2)
  public name!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  identityCard?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  phoneNumber!: string;
}

export class UpdateClientDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  public email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @MinLength(2)
  public name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  identityCard?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  phoneNumber?: string;
}
