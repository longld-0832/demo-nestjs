import { ApiProperty } from '@nestjs/swagger';
import { AuthTokenResponse } from '../auth.types';
import { TokenType } from '../enums/token-type.enum';

export class AuthTokenResponseDto implements AuthTokenResponse {
  @ApiProperty({
    description: 'Signed JWT to send as a Bearer token on subsequent requests.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({ example: TokenType.BEARER, enum: TokenType })
  tokenType: TokenType;

  @ApiProperty({
    description: 'Token lifetime (matches JWT_EXPIRES_IN).',
    example: '1h',
  })
  expiresIn: string;
}
