import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('follows')
@Unique(['followerId', 'followingId'])
@Index(['followingId'])
export class Follow extends BaseEntity {
  @ApiProperty({ description: 'The user who follows.' })
  @Column({ name: 'follower_id', type: 'uuid' })
  followerId: string;

  @ApiProperty({ description: 'The user being followed.' })
  @Column({ name: 'following_id', type: 'uuid' })
  followingId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_id' })
  follower: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'following_id' })
  following: User;
}
