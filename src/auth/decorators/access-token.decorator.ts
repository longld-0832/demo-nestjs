import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extracts the raw Bearer token from the Authorization header.
 * Returns an empty string when no Bearer token is present.
 */
export const AccessToken = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ headers: { authorization?: string } }>();
    const header = request.headers.authorization ?? '';
    return header.startsWith('Bearer ') ? header.slice(7) : '';
  },
);
