export interface JwtPayload {
  sub: string;
  email: string;
  /** Unique token id, used to revoke the token via the blacklist. */
  jti?: string;
  /** Expiry as a UNIX timestamp (seconds); set by jsonwebtoken. */
  exp?: number;
}

export interface AuthTokenResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}

export interface LogoutResponse {
  message: string;
}
