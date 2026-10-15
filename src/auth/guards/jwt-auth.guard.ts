import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly i18n: I18nService) {
    super();
  }

  /**
   * Covers every 401 case (missing, invalid, expired or revoked token) so the
   * response message is translated like the rest of the API.
   */
  handleRequest<TUser>(err: unknown, user: TUser | false): TUser {
    if (err || !user) {
      throw new UnauthorizedException(this.i18n.t('auth.UNAUTHORIZED'));
    }
    return user;
  }
}
