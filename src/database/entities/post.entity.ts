import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('posts')
export class Post extends BaseEntity {
  @ApiProperty({ example: 'My first post' })
  @Column()
  title: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  content: string;

  @ApiProperty({ default: false })
  @Column({ default: false })
  published: boolean;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;
}
