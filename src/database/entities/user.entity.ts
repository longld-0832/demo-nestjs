import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Post } from './post.entity';
import { Profile } from './profile.entity';

@Entity('users')
export class User extends BaseEntity {
  @ApiProperty({ example: 'alice@example.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: 'alice' })
  @Column()
  username: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @ApiProperty({ default: true })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: true,
    nullable: true,
  })
  profile: Profile;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];
}
