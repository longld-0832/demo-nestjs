import { ApiProperty } from '@nestjs/swagger';
import { DeleteArticleResponse } from '../articles.types';

export class DeleteArticleResponseDto implements DeleteArticleResponse {
  @ApiProperty({ example: 'Article deleted successfully' })
  message: string;
}
