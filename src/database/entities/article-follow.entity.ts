import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Article } from './article.entity';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

/** A user following an article to receive its updates in their feed. */
@Entity('article_follows')
@Unique(['userId', 'articleId'])
@Index(['articleId'])
export class ArticleFollow extends BaseEntity {
  @ApiProperty({ description: 'The user who follows the article.' })
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'The followed article.' })
  @Column({ name: 'article_id', type: 'uuid' })
  articleId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Article, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'article_id' })
  article: Article;
}
