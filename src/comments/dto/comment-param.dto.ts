import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IdParamDto } from '../../common/dto/id-param.dto';

export class CommentParamDto extends IdParamDto {
  @ApiProperty({ example: '6cd5818e-0be9-44e5-8d81-28f03f9dc572' })
  @IsUUID('all', { message: i18nValidationMessage('validation.IS_UUID') })
  commentId: string;
}
