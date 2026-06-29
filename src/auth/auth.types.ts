export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}

export interface LogoutResponse {
  message: string;
}
