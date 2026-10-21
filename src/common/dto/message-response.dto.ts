import { ApiProperty } from '@nestjs/swagger';
import { MessageResponse } from '../types/message-response.types';

/** Response body for actions that only confirm success with a message. */
export class MessageResponseDto implements MessageResponse {
  @ApiProperty({ example: 'Action completed successfully' })
  message: string;
}
