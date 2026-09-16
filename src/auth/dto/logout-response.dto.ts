import { ApiProperty } from '@nestjs/swagger';
import { LogoutResponse } from '../auth.types';

export class LogoutResponseDto implements LogoutResponse {
  @ApiProperty({ example: 'Logged out successfully' })
  message: string;
}
