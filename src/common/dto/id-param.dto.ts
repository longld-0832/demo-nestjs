import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class IdParamDto {
  @ApiProperty({ example: '28cd30cf-1891-40ee-8a1b-70c3050ba806' })
  @IsUUID('all', { message: i18nValidationMessage('validation.IS_UUID') })
  id: string;
}
