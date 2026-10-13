import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index } from 'typeorm';
import { AttachableType } from '../enums/attachable-type.enum';
import { BaseEntity } from './base.entity';

@Entity('attachments')
@Index(['attachableType', 'attachableId'])
export class Attachment extends BaseEntity {
  @ApiProperty({ enum: AttachableType, example: AttachableType.PROFILE })
  @Column({ name: 'attachable_type', type: 'varchar' })
  attachableType: AttachableType;

  @ApiProperty({ example: '46df1650-1de4-4bae-a76a-e81a43068233' })
  @Column({ name: 'attachable_id', type: 'uuid' })
  attachableId: string;

  @ApiProperty({
    example: '/public/avatars/0b6c1f9e-5d2a-4f3b-9a7e-2c1d8e4f6a5b.png',
  })
  @Column()
  url: string;

  @ApiProperty({ example: 'my-avatar.png' })
  @Column({ name: 'file_name' })
  fileName: string;

  @ApiProperty({ example: 'image/png' })
  @Column({ name: 'file_type' })
  fileType: string;

  @ApiProperty({ example: 102400, description: 'File size in bytes.' })
  @Column({ name: 'file_size', type: 'int' })
  fileSize: number;
}
