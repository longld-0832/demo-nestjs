import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Article } from './article.entity';
import { User } from './user.entity';

@Entity('comments')
@Index(['articleId'])
export class Comment extends BaseEntity {
  @ApiProperty({ example: 'Nice post!' })
  @Column({ type: 'text' })
  body: string;

  @ApiProperty({ example: '6cd5818e-0be9-44e5-8d81-28f03f9dc572' })
  @Column({ name: 'article_id', type: 'uuid' })
  articleId: string;

  @ApiProperty({ example: '6cd5818e-0be9-44e5-8d81-28f03f9dc572' })
  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @ManyToOne(() => Article, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;
}
