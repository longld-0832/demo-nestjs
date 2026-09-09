import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

const KEY_PREFIX = 'token:blacklist:';

@Injectable()
export class TokenBlacklistService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  /**
   * Blacklist a token (by its jti) until it would naturally expire.
   * The Redis key auto-expires after `ttlSeconds`, so revoked entries
   * are cleaned up exactly when the token itself is no longer valid.
   */
  async add(jti: string, ttlSeconds: number): Promise<void> {
    if (!jti || ttlSeconds <= 0) {
      return;
    }
    await this.redis.set(`${KEY_PREFIX}${jti}`, '1', 'EX', ttlSeconds);
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    if (!jti) {
      return false;
    }
    return (await this.redis.exists(`${KEY_PREFIX}${jti}`)) === 1;
  }
}
