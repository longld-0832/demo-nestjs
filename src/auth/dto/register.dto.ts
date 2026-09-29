import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class RegisterDto {
  @ApiProperty({ example: 'Alice Nguyen' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MinLength(2, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  @MaxLength(50, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  name: string;

  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
  email: string;

  @ApiProperty({ example: '0912345678' })
  @IsString({ message: 'phone number must be a string' })
  @Matches(/^[0-9]{10,11}$/, { message: 'phone number is not valid' })
  phoneNumber: string;

  @ApiProperty({ example: 'P@ssw0rd!', minLength: 8 })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MinLength(8, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  @MaxLength(72, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  password: string;

  @ApiProperty({ example: true })
  @IsBoolean({ message: 'accept terms must be a boolean' })
  acceptTerms: boolean;
}
