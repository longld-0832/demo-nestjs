export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}
