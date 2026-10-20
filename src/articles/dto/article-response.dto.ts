import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';

export class ArticleAuthorDto {
  @ApiProperty({ example: '7690668a-8eab-4409-9738-a3166d93b57b' })
  id: string;

  @ApiProperty({ example: 'Alice Nguyen' })
  name: string;
}

/** Article as shown in lists: everything except the (possibly long) content. */
export class ArticleListItemDto {
  @ApiProperty({ example: '6cd5818e-0be9-44e5-8d81-28f03f9dc572' })
  id: string;

  @ApiProperty({ example: 'my-first-article-3f9a1c' })
  slug: string;

  @ApiProperty({ example: 'My first article' })
  title: string;

  @ApiProperty({ example: 'A short summary of the article.' })
  description: string;

  @ApiProperty({ example: true })
  published: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: ArticleAuthorDto })
  author: ArticleAuthorDto;
}

export class ArticleDetailDto extends ArticleListItemDto {
  @ApiProperty({ example: 'The full content of the article.' })
  content: string;
}

export class ArticleListResponseDto {
  @ApiProperty({ type: [ArticleListItemDto] })
  items: ArticleListItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
