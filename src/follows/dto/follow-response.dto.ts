import { ApiProperty } from '@nestjs/swagger';
import { FollowResponse } from '../follows.types';

export class FollowResponseDto implements FollowResponse {
  @ApiProperty({ example: 'Followed successfully' })
  message: string;
}
