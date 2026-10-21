import { ApiProperty } from '@nestjs/swagger';
import { ArticleAuthorDto } from '../../articles/dto/article-response.dto';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';

export class CommentResponseDto {
  @ApiProperty({ example: '6cd5818e-0be9-44e5-8d81-28f03f9dc572' })
  id: string;

  @ApiProperty({ example: 'Nice post!' })
  body: string;

  @ApiProperty({ type: ArticleAuthorDto })
  author: ArticleAuthorDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CommentListResponseDto {
  @ApiProperty({ type: [CommentResponseDto] })
  items: CommentResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
