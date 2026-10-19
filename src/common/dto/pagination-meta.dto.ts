import { ApiProperty } from '@nestjs/swagger';
import { PaginationMeta } from '../types/pagination.types';

export class PaginationMetaDto implements PaginationMeta {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 42, description: 'Total number of matching items.' })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}
