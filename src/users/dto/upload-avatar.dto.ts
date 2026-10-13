import { ApiProperty } from '@nestjs/swagger';

/** Swagger-only description of the multipart body for avatar upload. */
export class UploadAvatarDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'JPEG, PNG or WEBP image, max 2MB.',
  })
  avatar: unknown;
}
