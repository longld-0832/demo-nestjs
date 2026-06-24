import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('profiles')
export class Profile extends BaseEntity {
  @ApiProperty({ example: 'Alice Nguyen', required: false })
  @Column({ name: 'full_name', nullable: true })
  fullName: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  bio: string;

  @ApiProperty({ required: false })
  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
