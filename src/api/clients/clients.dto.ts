import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateClientDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  public email?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
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
