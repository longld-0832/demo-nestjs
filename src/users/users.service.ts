import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from '../database/entities';

export interface CreateUserData {
  email: string;
  username: string;
  passwordHash: string;
}

const PG_UNIQUE_VIOLATION = '23505';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly i18n: I18nService,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ where: { email } });
  }

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.users.findOne({
      where: { email },
      select: { id: true, email: true, username: true, passwordHash: true },
    });
  }

  async create(data: CreateUserData): Promise<User> {
    const user = this.users.create(data);
    try {
      return await this.users.save(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === PG_UNIQUE_VIOLATION
      ) {
        throw new ConflictException(
          this.i18n.t('auth.EMAIL_ALREADY_REGISTERED'),
        );
      }
      this.logger.error(
        'Failed to save user',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        this.i18n.t('common.DATABASE_ERROR'),
      );
    }
  }
}
