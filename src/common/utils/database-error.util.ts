import { InternalServerErrorException, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { QueryFailedError } from 'typeorm';

const PG_UNIQUE_VIOLATION = '23505';

/** True when a write failed because it broke a Postgres unique constraint. */
export function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof QueryFailedError &&
    (error.driverError as { code?: string }).code === PG_UNIQUE_VIOLATION
  );
}

/**
 * Logs an unexpected database failure and rethrows it as a 500 with the
 * translated generic message. Use in the catch block of save/update/delete.
 */
export function throwDatabaseError(
  error: unknown,
  logger: Logger,
  i18n: I18nService,
  action: string,
): never {
  logger.error(action, error instanceof Error ? error.stack : String(error));
  throw new InternalServerErrorException(i18n.t('common.DATABASE_ERROR'));
}
