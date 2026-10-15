import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('articles')
export class Article extends BaseEntity {
  @ApiProperty({ example: 'my-first-article-3f9a1c' })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({ example: 'My first article' })
  @Column()
  title: string;

  @ApiProperty({ example: 'A short summary of the article.' })
  @Column()
  description: string;

  @ApiProperty({ example: 'The full content of the article.' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ default: false })
  @Column({ default: false })
  published: boolean;

  @ApiProperty({ example: '7690668a-8eab-4409-9738-a3166d93b57b' })
  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @ManyToOne(() => User, (user) => user.articles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;
}
