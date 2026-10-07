import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Alice Nguyen' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MinLength(2, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  @MaxLength(50, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  name?: string;

  @ApiPropertyOptional({ example: '0912345678' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @Matches(/^[0-9]{10,11}$/, {
    message: i18nValidationMessage('validation.IS_PHONE_NUMBER'),
  })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'Alice Nguyen' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MaxLength(100, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  fullName?: string;

  @ApiPropertyOptional({ example: 'Backend developer who loves NestJS.' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MaxLength(500, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  bio?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @IsOptional()
  @IsUrl({}, { message: i18nValidationMessage('validation.IS_URL') })
  @MaxLength(255, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  avatarUrl?: string;
}
